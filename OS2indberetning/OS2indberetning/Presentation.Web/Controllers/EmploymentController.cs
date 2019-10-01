﻿using System;
using System.Linq;
using Core.DomainModel;
using Core.DomainServices;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNet.OData;
using Microsoft.AspNet.OData.Query;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace OS2Indberetning.Controllers
{
    public class EmploymentsController : BaseController<Employment>
    {
        public EmploymentsController(IGenericRepository<Employment> repo, IGenericRepository<Person> personRepo, ILogger logger) : base(repo, personRepo,logger){}
        
        //GET: odata/Employments
        /// <summary>
        /// ODATA GET API endpoint for employments.
        /// Strips away CPR-number for persons returned.
        /// </summary>
        /// <param name="queryOptions"></param>
        /// <returns>Employments</returns>
        [EnableQuery]
        public IQueryable<Employment> Get(ODataQueryOptions<Employment> queryOptions)
        {
            var res =  GetQueryable(queryOptions).Include("Person");
            foreach (var employment in res)
            {
                employment.Person.CprNumber = "";
            }
            var currentTimestamp = (Int32)(DateTime.UtcNow.Subtract(new DateTime(1970, 1, 1))).TotalSeconds;

            // Remove inactive people
            res = res.Where(x => x.Person.IsActive);

            // Remove employments that have expired.
            return res.Where(x => x.EndDateTimestamp == 0 || x.EndDateTimestamp > currentTimestamp);
        }

        //GET: odata/Employments(5)
        /// <summary>
        /// GET API endpoint for a single employment.
        /// </summary>
        /// <param name="key">Returns the employment identified by key</param>
        /// <param name="queryOptions"></param>
        /// <returns></returns>
        public IQueryable<Employment> Get([FromODataUri] int key, ODataQueryOptions<Employment> queryOptions)
        {
            var res = GetQueryable(key, queryOptions).Include("Person");
            foreach (var employment in res)
            {
                employment.Person.CprNumber = "";
            }
            var currentTimestamp = (Int32)(DateTime.UtcNow.Subtract(new DateTime(1970, 1, 1))).TotalSeconds;

            // Remove inactive people
            res = res.Where(x => x.Person.IsActive);

            // Remove employments that have expired.
            return res.Where(x => x.EndDateTimestamp == 0 || x.EndDateTimestamp > currentTimestamp);
        }

        //PUT: odata/Employments(5)
        /// <summary>
        /// Not implemented.
        /// </summary>
        /// <param name="key"></param>
        /// <param name="delta"></param>
        /// <returns></returns>
        public new IActionResult Put([FromODataUri] int key, Delta<Employment> delta)
        {
            return base.Put(key, delta);
        }

        //POST: odata/Employments
        [EnableQuery]
        public new IActionResult Post(Employment Employment)
        {
            return StatusCode(StatusCodes.Status405MethodNotAllowed);
        }

        //PATCH: odata/Employments(5)
        /// <summary>
        /// PATCH API endpoint for employments
        /// </summary>
        /// <param name="key">Patches the employment identified by key</param>
        /// <param name="delta"></param>
        /// <returns></returns>
        [EnableQuery]
        [AcceptVerbs("PATCH", "MERGE")]
        public new IActionResult Patch([FromODataUri] int key, Delta<Employment> delta)
        {
            var firstOrDefault = Repo.AsQueryable().FirstOrDefault(x => x.Id == key);
            return firstOrDefault != null && firstOrDefault.PersonId.Equals(CurrentUser.Id) ? base.Patch(key, delta) : StatusCode(StatusCodes.Status403Forbidden);
        }

        //DELETE: odata/Employments(5)
        /// <summary>
        /// Not implemented.
        /// </summary>
        /// <param name="key"></param>
        /// <returns></returns>
        public new IActionResult Delete([FromODataUri] int key)
        {
            return StatusCode(StatusCodes.Status405MethodNotAllowed);
        }
    }
}