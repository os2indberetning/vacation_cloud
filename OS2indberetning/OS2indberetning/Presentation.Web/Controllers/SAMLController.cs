using Core.DomainModel;
using Core.DomainServices;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Presentation.Web.Controllers.API
{
    [Route("[Controller]/[action]")]
    [ApiController]
    public class SAMLController : ControllerBase
    {
        private readonly SignInManager<IdentityUser> _signInManager;
        private readonly IGenericRepository<Person> _personRepo;

        public SAMLController(SignInManager<IdentityUser> signinManager, IGenericRepository<Person> personRepo)
        {
            _signInManager = signinManager;
            _personRepo = personRepo;
        }

        public async Task<ActionResult> Callback()
        {

            var info = await _signInManager.GetExternalLoginInfoAsync();
            
            var cprClaim = info.Principal.Claims.Where(c => c.Type == "http://rep.oio.dk/cpr.dk/xml/schemas/core/2005/03/18/PersonCivilRegistrationIdentifier").First();
            var person = _personRepo.AsQueryable().FirstOrDefault(p => p.CprNumber.Equals(cprClaim.Value.Replace("-", "")));
            if (person == null)
            {
                throw new UnauthorizedAccessException("Bruger ikke fundet i databasen.");
            }
            if (!person.IsActive)
            {
                throw new UnauthorizedAccessException("Inaktiv bruger forsøgte at logge ind.");
            }
            HttpContext.Session.SetInt32("personId", person.Id);

            var isAdmin = info.Principal.Claims.Any(c => c.Type == "roles" && c.Value == "administrator");
            HttpContext.Session.SetString("isAdmin", isAdmin.ToString());

            var email = info.Principal.Claims.Where(c => c.Type == "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress").FirstOrDefault();
            if (email != null)
            {
                person.Mail = email.Value;
                _personRepo.Save();
                HttpContext.Session.SetString("email", email.Value);
            }

            return Redirect("/index");
        }
    }
}