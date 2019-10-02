﻿using System;
using System.Collections.Generic;
using System.Linq;
using Core.ApplicationServices.MailerService.Interface;
using Core.DomainModel;
using Core.DomainServices;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Core.ApplicationServices.MailerService.Impl
{
    public class MailService : IMailService
    {
        private readonly IGenericRepository<Report> _reportRepo;
        private readonly IMailSender _mailSender;
        private readonly ILogger _logger;
        private readonly IConfiguration _config;
        public MailService(IGenericRepository<Report> reportRepo, IMailSender mailSender,  ILogger logger, IConfiguration config)
        {
            _reportRepo = reportRepo;
            _mailSender = mailSender;
            _logger = logger;
            _config = config;
        }

        /// <summary>
        /// Sends an email to all leaders with pending reports to be approved.
        /// </summary>
        public void SendMails(DateTime payRoleDateTime)
        {
            var reports = GetLeadersWithPendingReportsMails();

            var driveBody = _config["PROTECTED_MAIL_BODY_DRIVE"];
            driveBody = driveBody.Replace("####", payRoleDateTime.ToString("dd-MM-yyyy"));

            foreach (var report in reports)
            {
                switch (report.ReportType)
                {
                    case ReportType.Drive:
                        // _mailSender.SendMail(report.ResponsibleLeader.Mail, ConfigurationManager.AppSettings["PROTECTED_MAIL_SUBJECT_DRIVE"], driveBody);
                        break;
                    case ReportType.Vacation:
                        _mailSender.SendMail(report.ResponsibleLeader.Mail, _config["PROTECTED_MAIL_SUBJECT_VACATION"], _config["PROTECTED_MAIL_BODY_VACATION"]);
                        break;
                    default:
                        _logger.LogError("Kunne ikke finde typen af rapport: " + report.Id);
                        break;
                }

            }

        }

        /// <summary>
        /// Gets the email address of all leaders that have pending reports to be approved.
        /// </summary>
        /// <returns>List of email addresses.</returns>
        public IEnumerable<Report> GetLeadersWithPendingReportsMails()
        {
            var reports = _reportRepo.AsNoTracking().Where(r => r.Status == ReportStatus.Pending).ToList();

            var reportsWithNoLeader = reports.Where(report => report.ResponsibleLeader == null);

            foreach (var report in reportsWithNoLeader)
            {
                _logger.LogError(report.Person.FullName + "s indberetning har ingen leder. Indberetningen kan derfor ikke godkendes.");
            }

            return reports.Where(report => report.ResponsibleLeaderId != null && !string.IsNullOrEmpty(report.ResponsibleLeader.Mail) && report.ResponsibleLeader.RecieveMail);
        }
    }
}
