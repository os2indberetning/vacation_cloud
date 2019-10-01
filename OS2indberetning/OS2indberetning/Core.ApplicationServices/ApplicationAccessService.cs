using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.ApplicationServices.Interfaces;
using Core.DomainModel;
using Microsoft.Extensions.Configuration;

namespace Core.ApplicationServices
{
    public class ApplicationAccessService : IApplicationAccessService
    {
        private readonly string _enabledApplications;

        public ApplicationAccessService(IConfiguration config)
        {
            _enabledApplications = config["ENABLED_APPLICATIONS"].ToLower();
        }

        public bool CanAccessAllApplications(Person person)
        {
            return CanAccessDrive(person) && CanAccssVacation(person);
        }

        public bool CanAccessDrive(Person person)
        {
            return _enabledApplications.Contains("drive");
        }

        public bool CanAccssVacation(Person person)
        {
            return _enabledApplications.Contains("vacation") && person.Employments.Any(x => x.OrgUnit.HasAccessToVacation);
        }
    }
}
