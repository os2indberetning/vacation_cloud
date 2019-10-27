﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Net;
using System.Reflection;
using Core.DomainModel;
using Core.DomainServices;
using Expression = System.Linq.Expressions.Expression;
using System.Net.Http;
using Microsoft.AspNet.OData;
using Microsoft.AspNet.OData.Query;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using System.Threading.Tasks;

namespace OS2Indberetning.Controllers
{
    public class BaseController<T> : ODataController where T : class
    {
        protected ODataValidationSettings ValidationSettings = new ODataValidationSettings();
        protected IGenericRepository<T> Repo;
        private readonly IGenericRepository<Person> _personRepo;
        private readonly PropertyInfo _primaryKeyProp;
        private readonly SignInManager<IdentityUser> _signInManager;
        private readonly ILogger<T> _logger;
        private Person _currentUser;


        //protected override void Initialize(HttpControllerContext requestContext)
        //{
        //    base.Initialize(requestContext);

        //    var enviornmnt = System.Environment.GetEnvironmentVariable("ASPNET_ENVIORNMENT");

        //    var httpUser = User.Identity.Name.Split('\\');

        //    if (enviornmnt == "DEMO")
        //    {
        //        var queryDictionary = requestContext.Request.Headers.Referrer.ParseQueryString();
        //        var demoUser = queryDictionary.Get("user");
        //        if (demoUser != null)
        //        {
        //            httpUser = new string[2]
        //            {
        //                ConfigurationManager.AppSettings["PROTECTED_AD_DOMAIN"],
        //                demoUser
        //            };
        //        }
        //    }


        //    if (httpUser.Length == 2 && String.Equals(httpUser[0], ConfigurationManager.AppSettings["PROTECTED_AD_DOMAIN"], StringComparison.CurrentCultureIgnoreCase))
        //    {
        //        var initials = httpUser[1].ToLower();

        //        // END DEBUG
        //        CurrentUser = _personRepo.AsQueryable().FirstOrDefault(p => p.Initials.ToLower().Equals(initials));

        //        if (CurrentUser == null)
        //        {
        //            //_logger.Log("AD-bruger ikke fundet i databasen (" + User.Identity.Name + "). " + User.Identity.Name + " har derfor ikke kunnet logge på.", "web", 3);
        //            throw new UnauthorizedAccessException("AD-bruger ikke fundet i databasen.");
        //        }

        //        if (!CurrentUser.IsActive)
        //        {
        //            //_logger.Log("Inaktiv bruger forsøgte at logge ind (" + User.Identity.Name + "). " + User.Identity.Name + " har derfor ikke kunnet logge på.", "web", 3);
        //            throw new UnauthorizedAccessException("Inaktiv bruger forsøgte at logge ind.");
        //        }
        //    }
        //    else
        //    {
        //        //_logger.Log("Gyldig domænebruger ikke fundet (" + User.Identity.Name + "). " + User.Identity.Name + " har derfor ikke kunnet logge på.", "web", 3);
        //        throw new UnauthorizedAccessException("Gyldig domænebruger ikke fundet (" + User.Identity.Name + "). " + User.Identity.Name + " har derfor ikke kunnet logge på..");
        //    }
        //}        
        public BaseController(
            IGenericRepository<T> repository,
            IGenericRepository<Person> personRepo,
            ILogger<T> logger,
            SignInManager<IdentityUser> signInManager)
        {
            _personRepo = personRepo;
            ValidationSettings.AllowedQueryOptions = AllowedQueryOptions.All;
            ValidationSettings.MaxExpansionDepth = 4;
            Repo = repository;
            _primaryKeyProp = Repo.GetPrimaryKeyProperty();
            _logger = logger;
            _signInManager = signInManager;
        }

        protected Person CurrentUser
        {
            get{
                if (_currentUser == null)
                {
                    var info = _signInManager.GetExternalLoginInfoAsync();
                    info.Wait();
                    var cprClaim = info.Result.Principal.Claims.Where(c => c.Type == "http://rep.oio.dk/cpr.dk/xml/schemas/core/2005/03/18/PersonCivilRegistrationIdentifier").First();
                    _currentUser = _personRepo.AsQueryable().FirstOrDefault(p => p.CprNumber.Equals(cprClaim.Value));
                }
                return _currentUser;
            }
        }

        protected IQueryable<T> GetQueryable(ODataQueryOptions<T> queryOptions)
        {
            if (queryOptions.Filter != null) {
                return (IQueryable<T>)queryOptions.Filter.ApplyTo(Repo.AsQueryable(), new ODataQuerySettings());
            }
            return Repo.AsQueryable();
        }

        protected IQueryable<T> GetQueryable(int key, ODataQueryOptions<T> queryOptions)
        {
            var result = new List<T> { };
            var entity = Repo.AsQueryable().FirstOrDefault(PrimaryKeyEquals(_primaryKeyProp, key));
            if (entity != null)
            {
                result.Add(entity);
            }
            if (queryOptions.Filter != null)
            {
                return (IQueryable<T>) queryOptions.Filter.ApplyTo(result.AsQueryable(), new ODataQuerySettings());
            }
            return result.AsQueryable();
        }
                
        protected IActionResult Put(int key, Delta<T> delta)
        {
            return StatusCode(StatusCodes.Status405MethodNotAllowed);
        }

        protected IActionResult Post(T entity)
        {
            TryValidateModel(entity);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                entity = Repo.Insert(entity);
                Repo.Save();
                return Created(entity);
            }
            catch (Exception e)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, e);
            }
        }

        protected IActionResult Patch(int key, Delta<T> delta)
        {
            //Validate(delta.GetEntity());

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var entity = Repo.AsQueryable().FirstOrDefault(PrimaryKeyEquals(_primaryKeyProp, key));
            if (entity == null)
            {
                return BadRequest("Unable to find entity with id " + key);
            }

            try
            {
                delta.Patch(entity);
                Repo.Save();
            }
            catch (Exception e)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, e);
            }

            return Updated(entity);
        }

        protected IActionResult Delete(int key)
        {
            var entity = Repo.AsQueryable().FirstOrDefault(PrimaryKeyEquals(_primaryKeyProp, key));
            if (entity == null)
            {
                return BadRequest("Unable to find entity with id " + key);
            }
            try
            {
                Repo.Delete(entity);
                Repo.Save();
            }
            catch (Exception e)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, e);
            }
            return Ok();
        }

        private static Expression<Func<T, bool>> PrimaryKeyEquals(PropertyInfo property, int value)
        {
            var param = Expression.Parameter(typeof(T));
            var body = Expression.Equal(Expression.Property(param, property), Expression.Constant(value));
            return Expression.Lambda<Func<T, bool>>(body, param);
        }
    }
}
