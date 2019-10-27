﻿using System.Linq;
using Core.DomainModel;
using Core.DomainServices;
using Microsoft.AspNet.OData;
using Microsoft.AspNet.OData.Query;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace OS2Indberetning.Controllers
{
    public class BankAccountsController : BaseController<BankAccount>
    {
        public BankAccountsController(IGenericRepository<BankAccount> repo, IGenericRepository<Person> personRepo, ILogger<BankAccount> logger, SignInManager<IdentityUser> signInManager) : base(repo, personRepo,logger,signInManager) { }
        
        //GET: odata/BankAccounts
        [EnableQuery]
        public IQueryable<BankAccount> Get(ODataQueryOptions<BankAccount> queryOptions)
        {
            var res =  GetQueryable(queryOptions);
            return res;
        }

        //GET: odata/BankAccounts(5)
        public IQueryable<BankAccount> Get([FromODataUri] int key, ODataQueryOptions<BankAccount> queryOptions)
        {
            return GetQueryable(key, queryOptions);
        }

        //PUT: odata/BankAccounts(5)
        /// <summary>
        /// Not implemented.
        /// </summary>
        /// <param name="key"></param>
        /// <param name="delta"></param>
        /// <returns></returns>
        public new IActionResult Put([FromODataUri] int key, Delta<BankAccount> delta)
        {
            return base.Put(key, delta);
        }

        //POST: odata/BankAccounts
        /// <summary>
        /// Post a new bankaccount if the user attempting to post is an admin.
        /// </summary>
        /// <param name="BankAccount"></param>
        /// <returns></returns>
        [EnableQuery]
        public new IActionResult Post(BankAccount BankAccount)
        {
           return CurrentUser.IsAdmin ? base.Post(BankAccount) : Unauthorized();
        }

        //PATCH: odata/BankAccounts(5)
        /// <summary>
        /// PATCH API endpoint for BankAccounts
        /// Patches the BankAccount identified by key, if the current user is an admin
        /// </summary>
        /// <param name="key"></param>
        /// <param name="delta"></param>
        /// <returns></returns>
        [EnableQuery]
        [AcceptVerbs("PATCH", "MERGE")]
        public new IActionResult Patch([FromODataUri] int key, Delta<BankAccount> delta)
        {
            return CurrentUser.IsAdmin ? base.Patch(key, delta) : Unauthorized();
        }

        //DELETE: odata/BankAccounts(5)
        /// <summary>
        /// DELETE API endpoint for BankAccounts.
        /// Deletes the BankAccount identified by key if the current user is an admin.
        /// </summary>
        /// <param name="key"></param>
        /// <returns></returns>
        public new IActionResult Delete([FromODataUri] int key)
        {
            return CurrentUser.IsAdmin ? base.Delete(key) : Unauthorized();
        }
    }
}