﻿using System;
using System.Collections.Generic;
using System.Linq;
using Core.ApplicationServices.Interfaces;
using Core.DomainModel;
using Core.DomainServices;

namespace Core.ApplicationServices
{
    public class SubstituteService : ISubstituteService
    {
        private readonly IGenericRepository<Substitute> _subRepo;
        private readonly IOrgUnitService _orgService;
        private readonly IReportService<Report> _reportService;
        private readonly IGenericRepository<Report> _reportRepo;

        public SubstituteService(IGenericRepository<Substitute> subRepo, IOrgUnitService orgService,
            IGenericRepository<Report> reportRepo, IReportService<Report> reportService)
        {
            _subRepo = subRepo;
            _orgService = orgService;
            _reportService = reportService;
            _reportRepo = reportRepo;
        }

        /// <summary>
        /// Removes CPR-number from Substitutes.
        /// </summary>
        /// <param name="subs">Subs to remove CPR-number from.</param>
        public void ScrubCprFromPersons(IQueryable<Substitute> subs)
        {
            foreach (var sub in subs.ToList())
            {
                sub.Sub.CprNumber = "";
                sub.Leader.CprNumber = "";
                sub.Person.CprNumber = "";

            }
        }

        /// <summary>
        /// Returns timestamp for Start of the day of timestamp.
        /// </summary>
        /// <param name="timestamp"></param>
        /// <returns></returns>
        public long GetStartOfDayTimestamp(long timestamp)
        {
            var dateTime = new DateTime(1970, 1, 1, 0, 0, 0, 0);
            dateTime = dateTime.AddSeconds(timestamp).ToLocalTime();
            dateTime = new DateTime(dateTime.Year, dateTime.Month, dateTime.Day, 0, 0, 0, 0).ToUniversalTime();
            var unixTimestamp = (Int32)(dateTime.Subtract(new DateTime(1970, 1, 1))).TotalSeconds;
            return unixTimestamp;
        }

        /// <summary>
        /// Returns end of day timestamp for timestamp.
        /// </summary>
        /// <param name="timestamp"></param>
        /// <returns></returns>
        public long GetEndOfDayTimestamp(long timestamp)
        {
            var dateTime = new DateTime(1970, 1, 1, 0, 0, 0, 0);
            dateTime = dateTime.AddSeconds(timestamp).Date.AddDays(1).AddTicks(-1);
            dateTime = new DateTime(dateTime.Year, dateTime.Month, dateTime.Day, 23, 59, 59, 999).ToUniversalTime();
            var unixTimestamp = (Int32)(dateTime.Subtract(new DateTime(1970, 1, 1))).TotalSeconds;
            return unixTimestamp;
        }

        /// <summary>
        /// Checks whether any existing subs for same Person or Orgunit with overlapping time periods exist.
        /// </summary>
        /// <param name="newSub">New Substitute to be created.</param>
        /// <returns>Returns true if the new sub is allowed to be inserted. False if not.</returns>
        public bool CheckIfNewSubIsAllowed(Substitute newSub)
        {
            // newSub is a substitute
            if (newSub.PersonId.Equals(newSub.LeaderId))
            {
                if (_subRepo.AsQueryable().Any(x => x.OrgUnitId.Equals(newSub.OrgUnitId) &&
                    // Id has to be different. Otherwise it will return true when trying to patch a sub
                    // Because a substitute already exists in the period, however that is the same sub we are trying to change.
                    x.Id != newSub.Id &&
                    x.Type == newSub.Type &&
                    ((newSub.StartDateTimestamp >= x.StartDateTimestamp && newSub.StartDateTimestamp <= x.EndDateTimestamp) ||
                    (newSub.StartDateTimestamp <= x.StartDateTimestamp && newSub.EndDateTimestamp >= x.StartDateTimestamp))))
                {
                    return false;
                }
            }
            // newSub is a personal approver
            else
            {
                if (_subRepo.AsQueryable().Any(x => x.PersonId.Equals(newSub.PersonId) && !x.PersonId.Equals(x.LeaderId) &&
                    // Id has to be different. Otherwise it will return true when trying to patch a sub
                    // Because a substitute already exists in the period, however that is the same sub we are trying to change.
                    x.Id != newSub.Id &&
                    x.Type == newSub.Type &&
                    ((newSub.StartDateTimestamp >= x.StartDateTimestamp && newSub.StartDateTimestamp <= x.EndDateTimestamp) ||
                    (newSub.StartDateTimestamp <= x.StartDateTimestamp && newSub.EndDateTimestamp >= x.StartDateTimestamp))))
                {
                    return false;
                }
            }
            return true;
        }

        public void UpdateReportsAffectedBySubstitute(Substitute sub)
        {
            if (sub.LeaderId == sub.PersonId)
            {
                // Substitute is a substitute - Not a Personal Approver.
                // Select reports to be updated based on OrgUnits
                var orgIds = new List<int>();
                orgIds.Add(sub.OrgUnitId);
                orgIds.AddRange(_orgService.GetChildOrgsWithoutLeader(sub.OrgUnitId).Select(x => x.Id));
                var idsOfLeadersOfImmediateChildOrgs = _orgService.GetIdsOfLeadersInImmediateChildOrgs(sub.OrgUnitId);

                var reports = _reportRepo.AsNoTracking().Where(rep => orgIds.Contains(rep.Employment.OrgUnitId) || idsOfLeadersOfImmediateChildOrgs.Contains(rep.PersonId)).ToList();
                foreach (var report in reports)
                {
                    if (report.ReportType != sub.Type) continue;
                    report.ResponsibleLeaderId = _reportService.GetResponsibleLeaderForReport(report).Id;
                    _reportRepo.Patch(report);
                }
                _reportRepo.Save();

            }
            else
            {
                // Substitute is a personal approver
                // Select reports to be updated based on PersonId on report
                var reports2 =
                    _reportRepo.AsNoTracking().Where(rep => rep.PersonId == sub.PersonId).ToList();
                foreach (var report in reports2.AsEnumerable())
                {
                    if (report.ReportType != sub.Type) continue;
                    report.ResponsibleLeaderId = _reportService.GetResponsibleLeaderForReport(report).Id;
                    _reportRepo.Patch(report);
                }
                _reportRepo.Save();
            }
        }
    }
}
