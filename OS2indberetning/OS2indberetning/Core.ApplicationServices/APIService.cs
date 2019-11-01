using Core.DomainModel;
using Core.DomainServices;
using Core.DomainServices.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Core.ApplicationServices
{
    public class APIService
    {
        private readonly IGenericRepository<OrgUnit> _orgUnitRepo;
        private readonly IGenericRepository<CachedAddress> _cachedRepo;
        private readonly IAddressLaunderer _actualLaunderer;
        private readonly IAddressCoordinates _coordinates;
        private readonly IGenericRepository<Person> _personRepo;

        public APIService(
            IGenericRepository<OrgUnit> orgUnitRepo,
            IGenericRepository<CachedAddress> cachedRepo,
            IAddressLaunderer actualLaunderer,
            IAddressCoordinates coordinate,
            IGenericRepository<Person> personRepo
            )
        {
            _orgUnitRepo = orgUnitRepo;
            _cachedRepo = cachedRepo;
            _actualLaunderer = actualLaunderer;
            _coordinates = coordinate;
            _personRepo = personRepo;
        }

        public void UpdateOrganization(APIOrganizationDTO apiOrganizationDTO)
        {
            //UpdateOrgUnits(apiOrganizationDTO.OrgUnits);
            UpdatePersons(apiOrganizationDTO.Persons);
        }

        private void UpdateOrgUnits(IEnumerable<APIOrgUnit> apiOrgUnits)
        {
            // Handle inserts
            var toBeInserted = apiOrgUnits.Where(s => !_orgUnitRepo.AsQueryable().Select(d => d.OrgId.ToString()).Contains(s.Id));
            foreach (var apiOrgUnit in toBeInserted)
            {
                var orgToInsert = new OrgUnit();
                orgToInsert.HasAccessToFourKmRule = false;
                orgToInsert.HasAccessToVacation = false;
                orgToInsert.DefaultKilometerAllowance = KilometerAllowance.Calculated;
                mapAPIOrgUnit(apiOrgUnit,ref orgToInsert);
                _orgUnitRepo.Insert(orgToInsert);
                _orgUnitRepo.Save();
            }

            // Handle updates
            var toBeUpdated = _orgUnitRepo.AsQueryable().Where(d => apiOrgUnits.Select(s => s.Id).Contains(d.OrgId.ToString()));
            foreach (var orgUnit in toBeUpdated)
            {
                var apiOrgUnit = apiOrgUnits.Where(s => s.Id == orgUnit.OrgId.ToString()).First();
                var orgToUpdate = orgUnit;
                mapAPIOrgUnit(apiOrgUnit, ref orgToUpdate);
                _orgUnitRepo.Update(orgToUpdate);
                _orgUnitRepo.Save();
            }


        }

        private void UpdatePersons(IEnumerable<APIPerson> apiPersons)
        {
            // Handle inserts
            //var toBeInserted = apiPersons.Where(s => !_persons)


            // Handle updates


            // Handle deletes
            var toBeDeleted = _personRepo.AsQueryable().Where(p => p.IsActive && !apiPersons.Select(ap => ap.CPR).Contains(p.CprNumber));
            foreach (var personToBeDeleted in toBeDeleted)
            {
                personToBeDeleted.IsActive = false;
            }
            _personRepo.Save();
                
        }

        private OrgUnit mapAPIOrgUnit(APIOrgUnit apiOrgUnit, ref OrgUnit orgUnit)
        {
            orgUnit.OrgId = int.Parse(apiOrgUnit.Id);
            if (!String.IsNullOrEmpty(apiOrgUnit.ParentId))
            {
                orgUnit.ParentId = _orgUnitRepo.AsQueryable().Where(o => o.OrgId.ToString() == apiOrgUnit.ParentId).Select(o => o.Id).First();
            }
            orgUnit.ShortDescription = apiOrgUnit.Name;
            orgUnit.LongDescription = apiOrgUnit.Name;
            var workAddress = GetWorkAddress(apiOrgUnit);
            if (workAddress != orgUnit.Address)
            {
                orgUnit.Address = workAddress;
            }
            return orgUnit;
        }


        /// <summary>
        /// Gets work address from API Address.
        /// </summary>
        /// <param name="org"></param>
        /// <returns>WorkAddress</returns>
        private WorkAddress GetWorkAddress(APIOrgUnit apiOrgunit)
        {
            var launderer = new CachedAddressLaunderer(_cachedRepo, _actualLaunderer, _coordinates);

            if (apiOrgunit.Address?.Street == null)
            {
                return null;
            }

            var splitStreetAddress = SplitAddressOnNumber(apiOrgunit.Address.Street);

            var addressToLaunder = new Address
            {
                StreetName = splitStreetAddress.ElementAt(0),
                StreetNumber = splitStreetAddress.Count > 1 ? splitStreetAddress.ElementAt(1) : "1",
                ZipCode = apiOrgunit.Address.PostalCode,
                Town = apiOrgunit.Address.City,
                Description = apiOrgunit.Name
            };

            addressToLaunder = launderer.Launder(addressToLaunder);

            var launderedAddress = new WorkAddress()
            {
                StreetName = addressToLaunder.StreetName,
                StreetNumber = addressToLaunder.StreetNumber,
                ZipCode = addressToLaunder.ZipCode,
                Town = addressToLaunder.Town,
                Latitude = addressToLaunder.Latitude ?? "",
                Longitude = addressToLaunder.Longitude ?? "",
                Description = apiOrgunit.Name
            };

            var existingOrg = _orgUnitRepo.AsQueryable().FirstOrDefault(x => x.OrgId.Equals(apiOrgunit.Id));

            // If the address hasn't changed then set the Id to be the same as the existing one.
            // That way a new address won't be created in the database.
            // If the address is not the same as the existing one,
            // Then the Id will be 0, and a new address will be created in the database.
            if (existingOrg != null
                && existingOrg.Address != null
                && existingOrg.Address.StreetName == launderedAddress.StreetName
                && existingOrg.Address.StreetNumber == launderedAddress.StreetNumber
                && existingOrg.Address.ZipCode == launderedAddress.ZipCode
                && existingOrg.Address.Town == launderedAddress.Town
                && existingOrg.Address.Latitude == launderedAddress.Latitude
                && existingOrg.Address.Longitude == launderedAddress.Longitude
                && existingOrg.Address.Description == launderedAddress.Description)
            {
                launderedAddress.Id = existingOrg.AddressId;
            }
            return launderedAddress;
        }

        /// <summary>
        /// Splits an address represented as "StreetName StreetNumber" into a list of "StreetName" , "StreetNumber"
        /// </summary>
        /// <param name="address">String to split</param>
        /// <returns>List of StreetName and StreetNumber</returns>
        private List<String> SplitAddressOnNumber(string address)
        {
            var result = new List<string>();
            var index = address.IndexOfAny("0123456789".ToCharArray());
            if (index == -1)
            {
                result.Add(address);
            }
            else
            {
                result.Add(address.Substring(0, index - 1));
                result.Add(address.Substring(index, address.Length - index));
            }
            return result;
        }

    }
}
