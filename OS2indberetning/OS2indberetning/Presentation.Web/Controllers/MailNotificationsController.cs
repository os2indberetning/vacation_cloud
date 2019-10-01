﻿using System.Linq;
using Core.DomainModel;
using Core.DomainServices;
using Microsoft.AspNet.OData;
using Microsoft.AspNet.OData.Query;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace OS2Indberetning.Controllers
{
    public class MailNotificationsController : BaseController<MailNotificationSchedule>
    {
        public MailNotificationsController(IGenericRepository<MailNotificationSchedule> repo, IGenericRepository<Person> personRepo, ILogger logger) : base(repo, personRepo, logger){}
        
        //GET: odata/MailNotificationSchedules
        /// <summary>
        /// GET API endpoint for MailNotifications.
        /// </summary>
        /// <param name="queryOptions"></param>
        /// <returns>MailNotifications</returns>
        [EnableQuery]
        public IQueryable<MailNotificationSchedule> Get(ODataQueryOptions<MailNotificationSchedule> queryOptions)
        {
            var res =  GetQueryable(queryOptions);
            return res;
        }

        //GET: odata/MailNotificationSchedules(5)
        /// <summary>
        /// GET API endpoint for a single MailNotification
        /// </summary>
        /// <param name="key"></param>
        /// <param name="queryOptions"></param>
        /// <returns>A single MailNotification</returns>
        public IQueryable<MailNotificationSchedule> Get([FromODataUri] int key, ODataQueryOptions<MailNotificationSchedule> queryOptions)
        {
            return GetQueryable(key, queryOptions);
        }

        //PUT: odata/MailNotificationSchedules(5)
        /// <summary>
        /// Not implemented.
        /// </summary>
        /// <param name="key"></param>
        /// <param name="delta"></param>
        /// <returns></returns>
        public new IActionResult Put([FromODataUri] int key, Delta<MailNotificationSchedule> delta)
        {
            return base.Put(key, delta);
        }

        //POST: odata/MailNotificationSchedules
        /// <summary>
        /// POST API endpoint for MailNotifications.
        /// Returns forbidden if the current user is not an admin.
        /// </summary>
        /// <param name="MailNotificationSchedule">The MailNotification to be posted.</param>
        /// <returns></returns>
        [EnableQuery]
        public new IActionResult Post(MailNotificationSchedule MailNotificationSchedule)
        {
            return CurrentUser.IsAdmin ? base.Post(MailNotificationSchedule) : StatusCode(StatusCodes.Status403Forbidden);
        }

        //PATCH: odata/MailNotificationSchedules(5)
        /// <summary>
        /// PATCH API endpoint for MailNotifications.
        /// </summary>
        /// <param name="key">Patches the MailNotification identified by key</param>
        /// <param name="delta"></param>
        /// <returns>Returns forbidden if the current user is not an admin.</returns>
        [EnableQuery]
        [AcceptVerbs("PATCH", "MERGE")]
        public new IActionResult Patch([FromODataUri] int key, Delta<MailNotificationSchedule> delta)
        {
            return CurrentUser.IsAdmin ? base.Patch(key, delta) : StatusCode(StatusCodes.Status403Forbidden);
        }

        //DELETE: odata/MailNotificationSchedules(5)
        /// <summary>
        /// DELETE API endpoint for MailNotifications.
        /// Returns forbidden if the current user is not an admin.
        /// </summary>
        /// <param name="key">Deletes the MailNotification identified by key</param>
        /// <returns></returns>
        public new IActionResult Delete([FromODataUri] int key)
        {
            return CurrentUser.IsAdmin ? base.Delete(key) : StatusCode(StatusCodes.Status403Forbidden);
        }
    }
}