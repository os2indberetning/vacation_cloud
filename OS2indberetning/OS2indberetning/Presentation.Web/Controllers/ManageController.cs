using Core.DomainModel;
using Core.DomainServices;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Linq;

namespace Presentation.Web.Controllers.API
{
    [ApiController]
    public class ManageController : ControllerBase
    {
        private IGenericRepository<OrgUnit> orgUnitRepo;
        public ManageController(IGenericRepository<OrgUnit> orgUnitRepo)
        {
            this.orgUnitRepo = orgUnitRepo;
        }

        [Route("manage/health")]
        public ActionResult Health()
        {
            // a simple health endpoint check that also fails if there is no connection to database
            var count = orgUnitRepo.AsNoTracking().Count();
            return Ok();
        }
    }
}
