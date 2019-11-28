using System;
using System.Collections.Generic;
using Core.DomainModel;

namespace Core.ApplicationServices.MailerService.Interface
{
    public interface IMailService
    {
        void SendMails();
        IEnumerable<Report> GetLeadersWithPendingReportsMails();
    }
}
