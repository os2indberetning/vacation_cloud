using System;
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
        private readonly IGenericRepository<Report> reportRepo;
        private readonly IMailSender mailSender;
        private readonly ILogger<MailService> logger;
        private readonly IConfiguration config;
        private IGenericRepository<MailNotificationSchedule> mailScheduleRepo;
        public MailService(IGenericRepository<Report> reportRepo, IMailSender mailSender, ILogger<MailService> logger, IConfiguration config, IGenericRepository<MailNotificationSchedule> mailScheduleRepo)
        {
            this.reportRepo = reportRepo;
            this.mailSender = mailSender;
            this.logger = logger;
            this.config = config;
            this.mailScheduleRepo = mailScheduleRepo;
        }

        /// <summary>
        /// Sends an email to all leaders with pending reports to be approved.
        /// </summary>
        public void SendMails()
        {
            var startOfDay = ToUnixTime(new DateTime(DateTime.Now.Year, DateTime.Now.Month, DateTime.Now.Day, 00, 00, 00));
            var endOfDay = ToUnixTime(new DateTime(DateTime.Now.Year, DateTime.Now.Month, DateTime.Now.Day, 23, 59, 59));

            var notifications = mailScheduleRepo.AsQueryable().Where(r => r.DateTimestamp >= startOfDay && r.DateTimestamp <= endOfDay && !r.Notified);

            if (!notifications.Any())
            {
                logger.LogInformation("No notifications found");
            }
            else
            {
                logger.LogInformation("Email notification(s) found");
                foreach (var notification in notifications.ToList())
                {
                    if (notification.Repeat)
                    {
                        var newDateTime = ToUnixTime(FromUnixTime(notification.DateTimestamp).AddMonths(1));
                        mailScheduleRepo.Insert(new MailNotificationSchedule()
                        {
                            DateTimestamp = newDateTime,
                            Notified = false,
                            Repeat = true
                        });
                    }
                    notification.Notified = true;

                    var reports = GetLeadersWithPendingReportsMails();
                    foreach (var report in reports)
                    {
                        switch (report.ReportType)
                        {
                            case ReportType.Drive:
                                // _mailSender.SendMail(report.ResponsibleLeader.Mail, ConfigurationManager.AppSettings[""], driveBody);
                                break;
                            case ReportType.Vacation:
                                mailSender.SendMail(report.ResponsibleLeader.Mail, config["Mail:VacationMail:Subject"], config["Mail:VacationMail:Body"]);
                                break;
                            default:
                                logger.LogError("Kunne ikke finde typen af rapport: " + report.Id);
                                break;
                        }
                    }

                }
                mailScheduleRepo.Save();
            }
        }

        /// <summary>
        /// Gets the email address of all leaders that have pending reports to be approved.
        /// </summary>
        /// <returns>List of email addresses.</returns>
        public IEnumerable<Report> GetLeadersWithPendingReportsMails()
        {
            var reports = reportRepo.AsQueryableLazy().Where(r => r.Status == ReportStatus.Pending).ToList();

            var reportsWithNoLeader = reports.Where(report => report.ResponsibleLeader == null);

            foreach (var report in reportsWithNoLeader)
            {
                logger.LogError(report.Person.FullName + "s indberetning har ingen leder. Indberetningen kan derfor ikke godkendes.");
            }

            return reports.Where(report => report.ResponsibleLeaderId != null && !string.IsNullOrEmpty(report.ResponsibleLeader.Mail) && report.ResponsibleLeader.RecieveMail);
        }

        private long ToUnixTime(DateTime date)
        {
            var epoch = new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc);
            return Convert.ToInt64((date - epoch).TotalSeconds);
        }

        private DateTime FromUnixTime(long unixTime)
        {
            var epoch = new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc);
            return epoch.AddSeconds(unixTime);
        }


    }
}
