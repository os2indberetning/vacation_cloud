﻿using System;
using System.Linq;
using Core.DomainModel;
using Core.DomainServices;
using Microsoft.AspNet.OData;
using Microsoft.AspNet.OData.Query;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Presentation.Web.Auth;

namespace OS2Indberetning.Controllers.Vacation
{
    public class VacationBalanceController : BaseController<VacationBalance>
    {


        public VacationBalanceController(IGenericRepository<VacationBalance> repo, IGenericRepository<Person> personRepo, ILogger<VacationBalance> logger, UserManager<IdentityPerson> userManager) : base(repo, personRepo,logger,userManager)
        {
        }

        // GET: odata/VacationBalance
        [EnableQuery]
        public IQueryable<VacationBalance> Get(ODataQueryOptions<VacationBalance> queryOptions)
        {
            var currentTimestamp = (Int32)(DateTime.UtcNow.Subtract(new DateTime(1970, 1, 1))).TotalSeconds;
            var currentYear = DateTime.Now.Year;
            if (Repo.AsQueryable().Any())
            {
                currentYear = Repo.AsQueryable().Max(y => y.Year);
            }
            
            var queryable =
                GetQueryable(queryOptions)
                    .Where(x => x.PersonId == CurrentUser.Id && x.Year == currentYear && (x.Employment.EndDateTimestamp == 0 || x.Employment.EndDateTimestamp >= currentTimestamp));

            return queryable;
        }


        //GET: odata/VacationBalance(5)
        public IQueryable<VacationBalance> Get([FromODataUri] int key, ODataQueryOptions<VacationBalance> queryOptions)
        {
            var res = GetQueryable(key, queryOptions);
            return res;
        }

        // PUT: odata/VacationBalance(5)
        /// <summary>
        /// Not implemented.
        /// </summary>
        /// <param name="key"></param>
        /// <param name="delta"></param>
        /// <returns></returns>
        public new IActionResult Put([FromODataUri] int key, Delta<VacationBalance> delta)
        {
            throw new NotSupportedException();
        }

        // POST: odata/VacationBalance
        [EnableQuery]
        public IActionResult Post(VacationBalance vacationBalance, string emailText)
        {
            throw new NotSupportedException();
        }

        // PATCH: odata/VacationBalance(6)
        [EnableQuery]
        [AcceptVerbs("PATCH", "MERGE")]
        public IActionResult Patch([FromODataUri] int key, Delta<VacationBalance> delta, string emailText)
        {
            throw new NotSupportedException();
        }

        // DELETE: odata/VacationBalance(5)
        public new IActionResult Delete([FromODataUri] int key)
        {
            throw new NotSupportedException();
        }

        // GET: odata/VacationBalance/Service.VacationForUser
        /// <summary>
        /// 
        /// </summary>
        /// <param name="id">Id of the employment</param>
        /// <returns></returns>
        [EnableQuery]
        [HttpGet]
        public IActionResult VacationForEmployment(int id)
        {
            var currentYear = DateTime.Now.Year;

            if (Repo.AsQueryable().Any())
            {
                currentYear = Repo.AsQueryable().Max(y => y.Year);
            }
            var currentTimestamp = (Int32)(DateTime.UtcNow.Subtract(new DateTime(1970, 1, 1))).TotalSeconds;
            var empl = Repo.AsQueryable().First(x => x.EmploymentId == id && x.Year == currentYear);
            return Ok(empl);
        }

        // GET: odata/VacationBalance/Service.VacationForUser
        /// <summary>
        /// Returns the people in the same organisation as the given employment.
        /// </summary>
        /// <param name="id">Id of the person</param>
        /// <returns></returns>
        [EnableQuery]
        [HttpGet]
        public IActionResult VacationForEmployee(int id)
        {
            var currentYear = DateTime.Now.Year;

            if (Repo.AsQueryable().Any())
            {
                currentYear = Repo.AsQueryable().Max(y => y.Year);
            }
            var currentTimestamp = (Int32)(DateTime.UtcNow.Subtract(new DateTime(1970, 1, 1))).TotalSeconds;
            var balances = Repo.AsQueryable().Where(x => x.PersonId == id && x.Year == currentYear && (x.Employment.EndDateTimestamp == 0 || x.Employment.EndDateTimestamp > currentTimestamp));
            VacationBalance totalBalance = new VacationBalance();

            foreach(var balance in balances)
            {

                totalBalance.FreeVacationHours += balance.FreeVacationHours;
                totalBalance.VacationHours += balance.VacationHours;
                totalBalance.TotalVacationHours += balance.TotalVacationHours;
                totalBalance.TransferredHours += balance.TransferredHours;
                totalBalance.UpdatedAt += balance.UpdatedAt;
                totalBalance.Year += balance.Year;
            }

            return Ok(totalBalance);
        }

    }
}
