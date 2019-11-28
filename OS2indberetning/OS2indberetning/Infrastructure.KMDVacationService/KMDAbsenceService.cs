using Core.DomainModel;
using Core.DomainServices.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Security.Cryptography.X509Certificates;
using System.ServiceModel;

namespace Infrastructure.KMDVacationService
{
    public class KMDAbsenceService : IKMDAbsenceService
    {
        private ILogger<KMDAbsenceService> logger;
        private IConfiguration config;

        public KMDAbsenceService(IConfiguration config, ILogger<KMDAbsenceService> logger)
        {
            this.config = config;
            this.logger = logger;
        }
        public void SetAbsence(IList<KMDAbsenceReport> absenceReports)
        {
            if (!Boolean.Parse(config["KMDVacationService:SetAbsenceAttendanceEnabled"]))
            {
                logger.LogWarning("KMDVacationService SetAbsenceAttendance is disabled. Not setting any absenceReports");
                return;
            }

            var webService = new SetAbsenceAttendance.SetAbsenceAttendance_OS_SIClient();
            var certificate = new X509Certificate2(config["KMDVacationService:CertificateFilename"], config["KMDVacationService:CertificatePassword"]);
            ((BasicHttpBinding)webService.Endpoint.Binding).Security.Transport.ClientCredentialType = HttpClientCredentialType.Certificate;
            webService.Endpoint.Address = new EndpointAddress(config["KMDVacationService:SetAbsenceAttendanceEndpoint"]);
            webService.Endpoint.EndpointBehaviors.Add(new LoggingBehavior(logger));

            webService.ClientCredentials.ClientCertificate.Certificate = certificate;

            foreach (var report in absenceReports)
            {
                var request = new SetAbsenceAttendance.SetAbsenceAttendanceRequest();
                request.StartDate = report.StartDate.ToString("yyyy-MM-dd");
                request.StartTime = report.StartTime?.ToString(@"hh\:mm\:ss");
                request.EndDate = report.EndDate.ToString("yyyy-MM-dd");
                request.EndTime = report.EndTime?.ToString(@"hh\:mm\:ss");
                request.OriginalStartDate = report.OldStartDate?.ToString("yyyy-MM-dd");
                request.OriginalStartTime = report.OldEndTime?.ToString(@"hh\:mm\:ss");
                request.OriginalEndDate = report.OldEndDate?.ToString("yyyy-MM-dd");
                request.OriginalEndTime = report.OldEndTime?.ToString(@"hh\:mm\:ss");
                request.PersonnelNumber = report.EmploymentId.ToString();
                request.Operation = report.KmdAbsenceOperation.AsString();
                request.AdditionalData = report.ExtraData;

                switch (report.Type)
                {
                    case VacationType.Regular:
                        request.AbsenceAttendanceType = "FE";
                        request.OriginalAbsenceAttendanceType = "FE";
                        break;
                    case VacationType.SixthVacationWeek:
                        request.AbsenceAttendanceType = "6F";
                        request.OriginalAbsenceAttendanceType = "6F";
                        break;
                    case VacationType.Senior:
                        request.AbsenceAttendanceType = "SO";
                        request.OriginalAbsenceAttendanceType = "SO";
                        break;
                    case VacationType.Care:
                        request.AbsenceAttendanceType = "OS";
                        request.OriginalAbsenceAttendanceType = "OS";
                        break;
                    default:
                        throw new NotSupportedException();
                }
                var response = webService.SetAbsenceAttendance_OS_SI(request);

                // If TYPE is empty, it succeeded
                if (response.ReturnStatus.StatusType == "" || response.ReturnStatus.StatusType == "S") continue;

                // Error occurred, cast exception containing error message.
                throw new KMDSetAbsenceFailedException(response.ReturnStatus.MessageText, request);
            }
        }

        public List<Child> GetChildren(Employment employment)
        {
            var children = new List<Child>();
            if (!Boolean.Parse(config["KMDVacationService:GetChildrenEnabled"]))
            {
                logger.LogWarning("KMDVacationService GetChildren is disabled. Returning empty list of children");
                return children;
            }

            var webService = new GetChildren.GetChildren_OS_SIClient();
            var certificate = new X509Certificate2(config["KMDVacationService:CertificateFilename"], config["KMDVacationService:CertificatePassword"]);
            webService.ClientCredentials.ClientCertificate.Certificate = certificate;
            ((BasicHttpBinding)webService.Endpoint.Binding).Security.Transport.ClientCredentialType = HttpClientCredentialType.Certificate;
            webService.Endpoint.Address = new EndpointAddress(config["KMDVacationService:GetChildrenEndpoint"]);
            webService.Endpoint.EndpointBehaviors.Add(new LoggingBehavior(logger));

            var request = new GetChildren.GetChildrenRequest();
            request.PersonnelNumber = employment.EmploymentId.ToString();

            var response = webService.GetChildren_OS_SI(request);

            foreach (var kmdChild in response.Child)
            {
                var child = new Child();
                child.Id = int.Parse(kmdChild.ChildNumber);
                child.FirstName = String.IsNullOrWhiteSpace(kmdChild.FirstName) ? "Ukendt navn" : kmdChild.FirstName;
                child.LastName = kmdChild.LastName ?? "";
                children.Add(child);
            }
            return children;
        }
    }
}
