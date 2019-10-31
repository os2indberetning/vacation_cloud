using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Core.DomainModel;
using Core.DomainServices;

namespace Core.ApplicationServices
{
    public class APIService
    {
        private readonly IGenericRepository<OrgUnit> _orgUnitRepo;

        public APIService(IGenericRepository<OrgUnit> orgUnitRepo)
        {
            _orgUnitRepo = orgUnitRepo;
        }

        public void UpdateOrganization(APIOrganizationDTO apiOrganizationDTO)
        {
            UpdateOrgUnits(apiOrganizationDTO.OrgUnits);
        }

        private Address mapAPIAddress(APIAddress apiAddress)
        { 
            
        }

        private OrgUnit mapAPIOrgUnit(APIOrgUnit apiOrgUnit, OrgUnit orgUnit)
        {
            orgUnit.OrgId = int.Parse(apiOrgUnit.Id);
            if (!String.IsNullOrEmpty(apiOrgUnit.ParentId))
            {
                orgUnit.ParentId = int.Parse(apiOrgUnit.ParentId);
            }
            orgUnit.ShortDescription = apiOrgUnit.Name;
            orgUnit.LongDescription = apiOrgUnit.Name;
            
            return orgUnit;
        }

        private void UpdateOrgUnits(IEnumerable<APIOrgUnit> apiOrgUnits)
        {
            // Handle inserts
            var toBeInserted = apiOrgUnits.Where(s => !_orgUnitRepo.AsQueryable().Select(d => d.OrgId.ToString()).Contains(s.Id));
            foreach (var apiOrgUnit in toBeInserted)
            {
                var orgUnit = mapAPIOrgUnit(apiOrgUnit, new OrgUnit());
                _orgUnitRepo.Insert(orgUnit);
            }

            // Handle updates
            var toBeUpdated = _orgUnitRepo.AsQueryable().Where(d => apiOrgUnits.Select(s => s.Id).Contains(d.OrgId.ToString()));
            foreach (var orgUnit in toBeUpdated)
            {
                var apiOrgUnit = apiOrgUnits.Where(s => s.Id == orgUnit.OrgId.ToString()).First();
                var updatedOrgUnit = mapAPIOrgUnit(apiOrgUnit, orgUnit);
                _orgUnitRepo.Update(updatedOrgUnit);
            }

            _orgUnitRepo.Save();

            //var i = 0;
            //foreach (var org in orgs)
            //{
            //    i++;
            //    if (i % 10 == 0)
            //    {
            //        Console.WriteLine("Migrating organisation " + i + " of " + orgs.Count() + ".");
            //    }

            //    var orgToInsert = _orgRepo.AsQueryable().FirstOrDefault(x => x.OrgId == org.LOSOrgId);

            //    var workAddress = GetWorkAddress(org);
            //    if (workAddress == null)
            //    {
            //        continue;
            //    }

            //    if (orgToInsert == null)
            //    {
            //        orgToInsert = _orgRepo.Insert(new OrgUnit());
            //        orgToInsert.HasAccessToFourKmRule = false;
            //        orgToInsert.HasAccessToVacation = false;
            //        orgToInsert.DefaultKilometerAllowance = KilometerAllowance.Calculated;
            //    }

            //    orgToInsert.Level = org.Level;
            //    orgToInsert.LongDescription = org.Navn;
            //    orgToInsert.ShortDescription = org.KortNavn;
            //    orgToInsert.OrgId = org.LOSOrgId;

            //    var addressChanged = false;

            //    if (workAddress != orgToInsert.Address)
            //    {
            //        addressChanged = true;
            //        orgToInsert.Address = workAddress;
            //    }



            //    if (orgToInsert.Level > 0)
            //    {
            //        orgToInsert.ParentId = _orgRepo.AsQueryable().Single(x => x.OrgId == org.ParentLosOrgId).Id;
            //    }
            //    _orgRepo.Save();

            //    if (addressChanged)
            //    {
            //        workAddress.OrgUnitId = orgToInsert.Id;
            //    }

            //}

            //Console.WriteLine("Done migrating organisations.");
        }

    }
}
