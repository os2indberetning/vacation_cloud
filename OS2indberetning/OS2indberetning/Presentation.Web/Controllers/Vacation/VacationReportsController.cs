﻿using System;
using System.Linq;
using Core.ApplicationServices.Interfaces;
using Core.DomainModel;
using Core.DomainServices;
using Microsoft.AspNet.OData;
using Microsoft.AspNet.OData.Query;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace OS2Indberetning.Controllers.Vacation
{
    public class VacationReportsController : BaseController<VacationReport>
    {
        private readonly IVacationReportService _reportService;
        private readonly IGenericRepository<Employment> _employmentRepo;

        private readonly ILogger _logger;

        public VacationReportsController(IGenericRepository<VacationReport> repo, IVacationReportService reportService, IGenericRepository<Person> personRepo, IGenericRepository<Employment> employmentRepo, ILogger logger)
            : base(repo, personRepo,logger)
        {
            _reportService = reportService;
            _employmentRepo = employmentRepo;
            _logger = logger;
        }

        // GET: odata/VacationReports
        /// <summary>
        /// ODATA GET API endpoint for drivereports.
        /// Converts string status to a ReportStatus enum and filters by it.
        /// Filters reports by leaderId and returns reports which that leader is responsible for approving.
        /// Does not return reports for which there is a substitute, unless getReportsWhereSubExists is true.
        /// </summary>
        /// <param name="queryOptions"></param>
        /// <param name="status"></param>
        /// <param name="leaderId"></param>
        /// <param name="getReportsWhereSubExists"></param>
        /// <returns>DriveReports</returns>
        [EnableQuery]
        public IActionResult Get(ODataQueryOptions<VacationReport> queryOptions, string status = "", int leaderId = 0, bool getReportsWhereSubExists = false)
        {
            var queryable = GetQueryable(queryOptions);

            ReportStatus reportStatus;
            if (ReportStatus.TryParse(status, true, out reportStatus))
            {
                if (reportStatus == ReportStatus.Accepted)
                {
                    // If accepted reports are requested, then return accepted and invoiced.
                    // Invoiced reports are accepted reports that have been processed for payment.
                    // So they are still accepted reports.
                    queryable =
                        queryable.Where(dr => dr.Status == ReportStatus.Accepted || dr.Status == ReportStatus.Invoiced);
                }
                else
                {
                    queryable = queryable.Where(dr => dr.Status == reportStatus);
                }

            }
            return Ok(queryable);
        }

        /// <summary>
        /// Returns the latest drivereport for a given user.
        /// Used for setting the option fields in DrivingView to the same as the latest report by the user.
        /// </summary>
        /// <param name="personId">Id of person to get report for.</param>
        /// <returns></returns>
        [EnableQuery]
        public IActionResult GetLatestReportForUser(int personId)
        {
            var report = Repo.AsQueryable()
                .Where(x => x.PersonId.Equals(personId))
                .OrderByDescending(x => x.CreatedDateTimestamp)
                .FirstOrDefault();

            if (report != null)
            {
                return Ok(report);
            }

            return StatusCode(StatusCodes.Status204NoContent);
        }

        //GET: odata/VacationReports(5)
        /// <summary>
        /// ODATA API endpoint for a single drivereport.
        /// </summary>
        /// <param name="key"></param>
        /// <param name="queryOptions"></param>
        /// <returns>A single DriveReport</returns>
        public IActionResult GetVacationReport([FromODataUri] int key, ODataQueryOptions<VacationReport> queryOptions)
        {
            return Ok(GetQueryable(key, queryOptions));
        }

        // PUT: odata/VacationReports(5)
        /// <summary>
        /// Not implemented.
        /// </summary>
        /// <param name="key"></param>
        /// <param name="delta"></param>
        /// <returns></returns>
        public new IActionResult Put([FromODataUri] int key, Delta<VacationReport> delta)
        {
            var report = Repo.AsQueryable().FirstOrDefault(x => x.Id == key);

            if (report == null) return StatusCode(StatusCodes.Status404NotFound);
            if (CurrentUser.Id != report.PersonId) return StatusCode(StatusCodes.Status403Forbidden);

            _reportService.Edit(delta);

            return Updated(report);
        }

        // POST: odata/VacationReports
        /// <summary>
        /// ODATA POST api endpoint for drivereports.
        /// Returns forbidden if the user associated with the posted report is not the current user.
        /// </summary>
        /// <param name="vacationReport"></param>
        /// <param name="emailText">The message to be sent to the owner of a report an admin has rejected or edited.</param>
        /// <returns>The posted report.</returns>
        [EnableQuery]
        public IActionResult Post(VacationReport vacationReport, string emailText)
        {
            if(CurrentUser.IsAdmin && emailText != null && vacationReport.Status == ReportStatus.Accepted)
            {
                // An admin is trying to edit an already approved report.
                var adminEditResult = _reportService.Create(vacationReport);
                // CurrentUser is restored after the calculation.
                _reportService.SendMailToUserAndApproverOfEditedReport(adminEditResult, emailText, CurrentUser, "redigeret");
                return Ok(adminEditResult);
            }

            if (CurrentUser.Id != vacationReport.PersonId)
            {
                return StatusCode(StatusCodes.Status403Forbidden);
            }

            var result = _reportService.Create(vacationReport);

            return Ok(result);
        }

        // PATCH: odata/VacationReports(5)
        /// <summary>
        /// PATCH API endpoint for vacationreports.
        /// Also returns forbidden if the report to be patched has a status other than pending.
        /// </summary>
        /// <param name="key"></param>
        /// <param name="delta"></param>
        /// <param name="emailText">The message to be sent to the owner of a report an admin has rejected or edited.</param>
        /// <returns></returns>
        [EnableQuery]
        [AcceptVerbs("PATCH", "MERGE")]
        public IActionResult Patch([FromODataUri] int key, Delta<VacationReport> delta, string emailText)
        {

            var report = Repo.AsQueryable().SingleOrDefault(x => x.Id == key);

            if (report == null)
            {
                return NotFound();
            }

            var leader = report.ResponsibleLeader;

            if (leader == null)
            {
                return StatusCode(StatusCodes.Status403Forbidden);
            }

            if (CurrentUser.IsAdmin && emailText != null && report.Status == ReportStatus.Accepted)
            {
                // An admin is trying to reject an approved report.
                try {
                    _reportService.DeleteReport(report);
                    _reportService.SendMailToUserAndApproverOfEditedReport(report, emailText, CurrentUser, "afvist");
                    return Ok();
                } catch(Exception e) {
                    _logger.LogError(e, "Fejl under forsøg på at afvise en allerede godkendt indberetning. Rapportens status er ikke ændret.");
                }
            }


            // Cannot approve own reports.
            if (report.PersonId == CurrentUser.Id)
            {
                return StatusCode(StatusCodes.Status403Forbidden);
            }

            // Cannot approve reports where you are not responsible leader
            if (!CurrentUser.Id.Equals(leader.Id))
            {
                return StatusCode(StatusCodes.Status403Forbidden);
            }


            // Return Unauthorized if the status is not pending when trying to patch.
            // User should not be allowed to change a Report which has been accepted or rejected.
            if (report.Status != ReportStatus.Pending)
            {
                _logger.LogError("Forsøg på at redigere indberetning med anden status end afventende. Rapportens status er ikke ændret.");
                return StatusCode(StatusCodes.Status403Forbidden);
            }
            
            _reportService.SendMailIfRejectedReport(key, delta, report.Person);
            return base.Patch(key, delta);
        }

        // DELETE: odata/VacationReport(5)
        /// <summary>
        /// DELETE API endpoint for drivereports.
        /// Deletes the report identified by key if the current user is the owner of the report or is an admin.
        /// </summary>
        /// <param name="key"></param>
        /// <returns></returns>
        public new IActionResult Delete([FromODataUri] int key)
        {
            var report = Repo.AsQueryable().SingleOrDefault(x => x.Id.Equals(key));

            if (report == null)
            {
                return NotFound();
            }

            if(!report.PersonId.Equals(CurrentUser.Id) && !CurrentUser.IsAdmin) return Unauthorized();

            try
            {
                _reportService.Delete(key);
            }
            catch (Infrastructure.KMDVacationService.KMDSetAbsenceFailedException ex)
            {
                _logger.LogError(ex, $"Fejl fra KMD's ferie snitflade ved forsøg på at slette indberetning - id: {report.Id}, employmentId: {report.Employment.Id}, person: {report.Person.FullName} \n REQUEST: startdate: {ex.Request.StartDate}, starttime: {ex.Request.StartTime}, enddate: {ex.Request.EndDate}, endtime: {ex.Request.EndTime}, operation: {ex.Request.Operation}, personlnumber: {ex.Request.PersonnelNumber}");
                return StatusCode(StatusCodes.Status400BadRequest, ex);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Fejl under slet ferieindberetning - id: {report.Id}, employmentId: {report.Employment.Id}, person: {report.Person.FullName}");
                throw;
            }
            _logger.LogInformation($"Ferieindberetning er slettet - id: {report.Id}, employmentId: {report.Employment?.Id}, person: {report.Person?.FullName}, startdato: {report.StartTimestamp}, starttid: {report.StartTime}, slutdato: {report.EndTimestamp}, sluttid: {report.EndTime}, fraværstype: {report.VacationType}");
            return Ok();
        }

        [EnableQuery]
        [HttpGet]
        public IActionResult ApproveReport(int key = 0)
        {
            var report = Repo.AsQueryable().SingleOrDefault(x => x.Id == key);

            if (report == null) return NotFound();
            if (HasReportAccess(report, CurrentUser)) StatusCode(StatusCodes.Status403Forbidden);
            if (report.Status == ReportStatus.Accepted) StatusCode(StatusCodes.Status400BadRequest);
            // All good, user has rights to approve the report.
            try
            {
                _reportService.ApproveReport(report, CurrentUser);
            }
            catch(Infrastructure.KMDVacationService.KMDSetAbsenceFailedException ex)
            {
                _logger.Log($"Fejl fra KMD's ferie snitflade ved forsøg på at godkende indberetning - id: {report.Id}, employmentId: {report.Employment.Id}, person: {report.Person.FullName}  \n REQUEST: {ex.Request}", "web", ex, 1);
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Fejl under godkend ferieindberetning - id: {report.Id}, employmentId: {report.Employment.Id}, person: {report.Person.FullName}");
                throw;
            }
            _logger.LogInformation($"Ferieindberetning er godkendt - id: {report.Id}, employmentId: {report.Employment.Id}, person: {report.Person.FullName}");
            return Ok(report);
        }
        
        [EnableQuery]
        [HttpGet]
        public IActionResult RejectReport(int key, string comment = "")
        {
            var report = Repo.AsQueryable().SingleOrDefault(x => x.Id == key);

            if (report == null) return NotFound();
            if (HasReportAccess(report, CurrentUser)) StatusCode(StatusCodes.Status403Forbidden);

            try
            {
                _reportService.RejectReport(report, CurrentUser, comment);
            }
            catch (Infrastructure.KMDVacationService.KMDSetAbsenceFailedException ex)
            {
                _logger.Log($"Fejl fra KMD's ferie snitflade ved forsøg på at afvise indberetning - id: {report.Id}, employmentId: {report.Employment.Id}, person: {report.Person.FullName}  \n REQUEST: {ex.Request}", "web", ex, 1);
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Fejl under afvis ferieindberetning - id: {report.Id}, employmentId: {report.Employment.Id}, person: {report.Person.FullName}");
                throw;
            }

            try
            {
                _reportService.SendMailIfRejectedReport(report);
            }
            catch(Exception)
            {
            }
            _logger.LogInformation($"Ferieindberetning er afvist - id: {report.Id}, employmentId: {report.Employment.Id}, person: {report.Person.FullName}");

            return Ok(report);
        }

        private bool HasReportAccess(VacationReport report, Person person)
        {
            var leader = report.ResponsibleLeaderId;

            if (report.PersonId == person.Id) return false;
            if (leader == null) return false;
            if (person.Id.Equals(leader)) return true;
            _logger.LogWarning("Forsøg på at redigere indberetning med anden status end afventende. Rapportens status er ikke ændret.");
            return false;
        }
    }
}