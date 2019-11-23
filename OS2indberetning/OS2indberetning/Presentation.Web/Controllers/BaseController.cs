using Core.DomainModel;
using Core.DomainServices;
using Microsoft.AspNet.OData;
using Microsoft.AspNet.OData.Query;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Presentation.Web.Auth;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using Expression = System.Linq.Expressions.Expression;

namespace OS2Indberetning.Controllers
{
    public class BaseController<T> : ODataController where T : class
    {
        protected ODataValidationSettings ValidationSettings = new ODataValidationSettings();
        protected IGenericRepository<T> Repo;
        private readonly IGenericRepository<Person> _personRepo;
        private readonly PropertyInfo _primaryKeyProp;
        private readonly ILogger<T> _logger;
        private readonly UserManager<IdentityPerson> _userManager;

        public BaseController(
            IGenericRepository<T> repository,
            IGenericRepository<Person> personRepo,
            ILogger<T> logger,
            UserManager<IdentityPerson> userManager)
        {
            _personRepo = personRepo;
            ValidationSettings.AllowedQueryOptions = AllowedQueryOptions.All;
            ValidationSettings.MaxExpansionDepth = 4;
            Repo = repository;
            _primaryKeyProp = Repo.GetPrimaryKeyProperty();
            _logger = logger;
            _userManager = userManager;
        }

        protected Person CurrentUser
        {
            get{
                var user = _userManager.GetUserAsync(HttpContext.User);
                user.Wait();
                return user.Result.Person;
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
