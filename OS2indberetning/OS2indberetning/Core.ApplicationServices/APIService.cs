using Core.ApplicationServices.Interfaces;
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
        private readonly IGenericRepository<PersonalAddress> _personalAddressRepo;
        private readonly AddressHistoryService _addressHistoryService;
        private readonly ISubstituteService _subService;
        private readonly IGenericRepository<Substitute> _subRepo;
        private readonly IGenericRepository<Report> _reportRepo;
        private readonly IReportService<Report> _reportService;
        private readonly IGenericRepository<VacationBalance> _vacationBalanceRepo;

        public APIService(
            IGenericRepository<OrgUnit> orgUnitRepo,
            IGenericRepository<CachedAddress> cachedRepo,
            IAddressLaunderer actualLaunderer,
            IAddressCoordinates coordinates,
            IGenericRepository<Person> personRepo,
            IGenericRepository<PersonalAddress> personalAddressRepo,
            AddressHistoryService addressHistoryService,
            ISubstituteService subService,
            IGenericRepository<Substitute> subRepo,
            IGenericRepository<Report> reportRepo,
            IReportService<Report> reportService,
            IGenericRepository<VacationBalance> vacationBalanceRepo            
            )
        {
            _orgUnitRepo = orgUnitRepo;
            _cachedRepo = cachedRepo;
            _actualLaunderer = actualLaunderer;
            _coordinates = coordinates;
            _personRepo = personRepo;
            _personalAddressRepo = personalAddressRepo;
            _addressHistoryService = addressHistoryService;
            _subService = subService;
            _subRepo = subRepo;
            _reportRepo = reportRepo;
            _reportService = reportService;
            _vacationBalanceRepo = vacationBalanceRepo;
        }

        public void UpdateOrganization(APIOrganizationDTO apiOrganizationDTO)
        {
            UpdateOrgUnits(apiOrganizationDTO.OrgUnits);
            UpdatePersons(apiOrganizationDTO.Persons);
            UpdateVacationBalances(apiOrganizationDTO.Persons);
            // Todo block to look at when we include drive solution in this solution
            // TODO: Send mail about dirty addresses (once we include drive solution in this solution)
            //_addressHistoryService.UpdateAddressHistories();
            //_addressHistoryService.CreateNonExistingHistories();

            UpdateLeadersOnExpiredOrActivatedSubstitutes();
            AddLeadersToReportsThatHaveNone();
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
            var toBeInserted = apiPersons.Where(s => !_personRepo.AsQueryable().Select(d => d.CprNumber).Contains(s.CPR));
            foreach (var apiPerson in toBeInserted)
            {
                var personToInsert = new Person();
                personToInsert.IsAdmin = false;
                personToInsert.RecieveMail = true;
                personToInsert.Employments = new List<Employment>();
                mapAPIPerson(apiPerson, ref personToInsert);
                _personRepo.Insert(personToInsert);
            }

            // Handle updates
            var toBeUpdated = _personRepo.AsQueryable().Where(d => apiPersons.Select(s => s.CPR).Contains(d.CprNumber));
            foreach (var person in toBeUpdated)
            {
                var apiPerson = apiPersons.Where(s => s.CPR == person.CprNumber).First();
                var personToUpdate = person;
                mapAPIPerson(apiPerson, ref personToUpdate);
                _personRepo.Update(personToUpdate);
            }

            // Handle deletes
            var toBeDeleted = _personRepo.AsQueryable().Where(p => p.IsActive && !apiPersons.Select(ap => ap.CPR).Contains(p.CprNumber));
            foreach (var personToBeDeleted in toBeDeleted)
            {
                personToBeDeleted.IsActive = false;
                foreach (var employment in personToBeDeleted.Employments)
                {
                    if (employment.EndDateTimestamp == 0 || employment.EndDateTimestamp > GetUnixTime(DateTime.Now.Date))
                    {
                        employment.EndDateTimestamp = GetUnixTime(DateTime.Now.Date);
                    }                    
                }
                _personRepo.Update(personToBeDeleted);
            }

            _personRepo.Save();

            // Attach personal addressses
            foreach (var apiPerson in apiPersons)
            {
                UpdateHomeAddress(apiPerson);
            }
            _personalAddressRepo.Save();
        }

        private void UpdateVacationBalances(IEnumerable<APIPerson> persons)
        {
            foreach (var apiPerson in persons)
            {
                var person = _personRepo.AsQueryable().First(p => p.CprNumber == apiPerson.CPR);
                foreach (var apiEmployment in apiPerson.Employments)
                {
                    var apiVacationBalance = apiEmployment.VacationBalance;
                    if (apiVacationBalance != null)
                    {
                        var employment =  person.Employments.First(e => e.EmploymentId.ToString() == apiEmployment.EmployeeNumber);

                        var vacationBalance = _vacationBalanceRepo.AsQueryable().FirstOrDefault(
                            x => x.PersonId == person.Id && x.EmploymentId == employment.Id && x.Year == apiVacationBalance.VacationEarnedYear);

                        if (vacationBalance == null)
                        {
                            vacationBalance = new VacationBalance
                            {
                                PersonId = person.Id,
                                EmploymentId = employment.Id,
                                Year = apiVacationBalance.VacationEarnedYear
                            };
                            _vacationBalanceRepo.Insert(vacationBalance);
                        }
                        vacationBalance.FreeVacationHours = apiVacationBalance.FreeVacationHoursTotal ?? 0;
                        vacationBalance.TransferredHours = apiVacationBalance.TransferredVacationHours ?? 0;
                        vacationBalance.VacationHours = apiVacationBalance.VacationHoursWithPay ?? 0;
                        vacationBalance.UpdatedAt = GetUnixTime(apiVacationBalance.UpdatedDate);
                    }
                }
            }
            _vacationBalanceRepo.Save();
        }

        private void mapAPIPerson(APIPerson apiPerson, ref Person personToInsert)
        {
            personToInsert.CprNumber = apiPerson.CPR;
            personToInsert.FirstName = apiPerson.FirstName ?? "ikke opgivet";
            personToInsert.LastName = apiPerson.LastName ?? "ikke opgivet";
            personToInsert.Initials = apiPerson.Initials ?? "";
            personToInsert.FullName = personToInsert.FirstName + " " + personToInsert.LastName;
            if (!String.IsNullOrEmpty(personToInsert.Initials))
            {
                personToInsert.FullName += "[" + personToInsert.Initials + "]";
            }
            // only update email if supplied
            if (apiPerson.Email != null || personToInsert.Mail == null)
            {
                personToInsert.Mail = apiPerson.Email ?? "";
            }            
            personToInsert.IsActive = true;
            foreach(var existingEmployment in personToInsert.Employments.Where(e => e.EndDateTimestamp == 0 || e.EndDateTimestamp > GetUnixTime(DateTime.Now.Date)))
            {
                // if database active employment does not exist in source then set end date
                if (!apiPerson.Employments.Select(s => s.EmployeeNumber).Contains(existingEmployment.EmploymentId.ToString())) 
                {
                    existingEmployment.EndDateTimestamp = GetUnixTime(DateTime.Now.Date);
                }
            }
            foreach (var sourceEmployment in apiPerson.Employments)
            {
                var employment = personToInsert.Employments.Where(d => d.EmploymentId.ToString() == sourceEmployment.EmployeeNumber).FirstOrDefault();
                if (employment == null)
                {
                    employment = new Employment();
                    personToInsert.Employments.Add(employment);
                }
                var orgUnitId = _orgUnitRepo.AsQueryable().Where(o => o.OrgId.ToString() == sourceEmployment.OrgUnitId).Select(o => o.Id).First();
                employment.OrgUnitId = orgUnitId;
                employment.Position = sourceEmployment.Position ?? "";
                employment.IsLeader = sourceEmployment.Manager;
                employment.StartDateTimestamp = GetUnixTime( sourceEmployment.FromDate ?? DateTime.Now.Date );
                employment.ExtraNumber = sourceEmployment.ExtraNumber ?? 0;
                employment.EmploymentType = sourceEmployment.EmploymentType ?? 0;
                employment.CostCenter = sourceEmployment.CostCenter == null ? 0 : long.Parse(sourceEmployment.CostCenter);
                employment.EmploymentId = int.Parse(sourceEmployment.EmployeeNumber);
                employment.EndDateTimestamp = sourceEmployment.ToDate == null ? 0 : GetUnixTime( sourceEmployment.ToDate.Value.AddDays(1) );
            }
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

        private long GetUnixTime(DateTime dateTime)
        {
            return (Int32)(dateTime.Subtract(new DateTime(1970, 1, 1).Date)).TotalSeconds;
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

        /// <summary>
        /// Updates ResponsibleLeader on all reports that had a substitute which expired yesterday or became active today.
        /// </summary>
        public void UpdateLeadersOnExpiredOrActivatedSubstitutes()
        {
            // TODO Find something more generic for updating drive and vacation reports.
            var yesterdayTimestamp = (Int32)(DateTime.UtcNow.Subtract(new DateTime(1970, 1, 1).AddDays(1))).TotalSeconds;
            var currentTimestamp = (Int32)(DateTime.UtcNow.Subtract(new DateTime(1970, 1, 1))).TotalSeconds;

            var endOfDayStamp = _subService.GetEndOfDayTimestamp(yesterdayTimestamp);
            var startOfDayStamp = _subService.GetStartOfDayTimestamp(currentTimestamp);

            var affectedSubstitutes = _subRepo.AsQueryable().Where(s => (s.EndDateTimestamp == endOfDayStamp) || (s.StartDateTimestamp == startOfDayStamp)).ToList();
            Console.WriteLine(affectedSubstitutes.Count() + " substitutes have expired or become active. Updating affected reports.");
            foreach (var sub in affectedSubstitutes)
            {
                _subService.UpdateReportsAffectedBySubstitute(sub);
            }
        }

        public void AddLeadersToReportsThatHaveNone()
        {
            // Fail-safe as some reports for unknown reasons have not had a leader attached
            Console.WriteLine("Adding leaders to drive reports that have none");
            var i = 0;
            var reports = _reportRepo.AsQueryable().Where(r => r.ResponsibleLeader == null || r.ActualLeader == null).ToList();
            foreach (var report in reports)
            {
                i++;
                report.ResponsibleLeaderId = _reportService.GetResponsibleLeaderForReport(report).Id;
                report.ActualLeaderId = _reportService.GetActualLeaderForReport(report).Id;
                if (i % 100 == 0)
                {
                    Console.WriteLine("Saving to database");
                    _reportRepo.Save();
                }
            }
            _reportRepo.Save();
        }

        /// <summary>
        /// Updates home address for person identified by personId.
        /// </summary>
        /// <param name="empl"></param>
        /// <param name="personId"></param>
        public void UpdateHomeAddress(APIPerson apiPerson)
        {
            if (apiPerson.Address.Street == null)
            {
                return;
            }

            var person = _personRepo.AsQueryable().FirstOrDefault(x => x.CprNumber == apiPerson.CPR);
            if (person == null)
            {
                throw new Exception("Person does not exist.");
            }

            var launderer = new CachedAddressLaunderer(_cachedRepo, _actualLaunderer, _coordinates);

            var splitStreetAddress = SplitAddressOnNumber(apiPerson.Address.Street);

            var addressToLaunder = new Address
            {
                Description = person.FullName,
                StreetName = splitStreetAddress.ElementAt(0),
                StreetNumber = splitStreetAddress.Count > 1 ? splitStreetAddress.ElementAt(1) : "1",
                ZipCode = apiPerson.Address.PostalCode,
                Town = apiPerson.Address.City ?? "",
            };
            addressToLaunder = launderer.Launder(addressToLaunder);

            var launderedAddress = new PersonalAddress()
            {
                PersonId = person.Id,
                Type = PersonalAddressType.Home,
                StreetName = addressToLaunder.StreetName,
                StreetNumber = addressToLaunder.StreetNumber,
                ZipCode = addressToLaunder.ZipCode,
                Town = addressToLaunder.Town,
                Latitude = addressToLaunder.Latitude ?? "",
                Longitude = addressToLaunder.Longitude ?? "",
                Description = addressToLaunder.Description
            };

            var homeAddr = _personalAddressRepo.AsQueryable().FirstOrDefault(x => x.PersonId.Equals(person.Id) &&
                x.Type == PersonalAddressType.Home);

            if (homeAddr == null)
            {
                _personalAddressRepo.Insert(launderedAddress);
            }
            else
            {
                if (homeAddr != launderedAddress)
                {
                    // Address has changed
                    // Change type of current (The one about to be changed) home address to OldHome.
                    // Is done in loop because there was an error that created one or more home addresses for the same person.
                    // This will make sure all home addresses are set to old if more than one exists.
                    foreach (var addr in _personalAddressRepo.AsQueryable().Where(x => x.PersonId.Equals(person.Id) && x.Type == PersonalAddressType.Home).ToList())
                    {
                        addr.Type = PersonalAddressType.OldHome; ;
                    }

                    // Update actual current home address.
                    _personalAddressRepo.Insert(launderedAddress);
                    _personalAddressRepo.Save();
                }
            }
        }

    }


}
