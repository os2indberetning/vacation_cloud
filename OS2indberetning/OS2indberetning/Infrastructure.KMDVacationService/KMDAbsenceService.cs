using System.Collections.Generic;
using Core.DomainModel;
using Core.DomainServices.Interfaces;
using System;
using System.Configuration;
using Microsoft.Extensions.Configuration;
using System.Security.Cryptography.X509Certificates;

namespace Infrastructure.KMDVacationService
{
    public class KMDAbsenceService : IKMDAbsenceService
    {
        private X509Certificate2 certificate;

        public KMDAbsenceService(IConfiguration config)
        {
            certificate = new X509Certificate2(config["KMDVacationService:CertificateFilename"], config["KMDVacationService:CertificatePassword"]);
        }
        public void SetAbsence(IList<KMDAbsenceReport> absenceReports)
        {
            //var webService = new SetAbsenceAttendance.SetAbsenceAttendance_OS_SIClient("HTTPS_Port");
            // todo set bindings etc - maybe default is ok
            var webService = new SetAbsenceAttendance.SetAbsenceAttendance_OS_SIClient();
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
#if !DEBUG
            var webService = new GetChildren.GetChildren_OS_SIClient();
            // todo set bindings etc - maybe default is ok
            webService.ClientCredentials.ClientCertificate.Certificate = certificate;

            var request = new GetChildren.GetChildrenRequest();
            request.PersonnelNumber = employment.EmploymentId.ToString();

            var response = webService.GetChildren_OS_SI(request);

            foreach (var child in response.Child)
            {
                children.Add(new Child
                {
                    Id = int.Parse(child.ChildNumber),
                    FirstName = child.FirstName,
                    LastName = child.LastName
                });
            }
#endif
            return children;
        }
    }
}
