using Core.DomainModel;
using Core.DomainServices;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Presentation.Web.Auth;
using Sustainsys.Saml2;
using Sustainsys.Saml2.AspNetCore2;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Presentation.Web.Controllers.API
{
    [Route("[Controller]/[action]")]
    [ApiController]
    public class SAMLController : ControllerBase
    {
        private readonly SignInManager<IdentityPerson> _signInManager;
        private readonly IGenericRepository<Person> _personRepo;
        private readonly ILogger<SAMLController> _logger;

        public SAMLController(SignInManager<IdentityPerson> signinManager, IGenericRepository<Person> personRepo, ILogger<SAMLController> logger)
        {
            _signInManager = signinManager;
            _personRepo = personRepo;
            _logger = logger;
        }

        public ActionResult Login()
        {
            var properties = _signInManager.ConfigureExternalAuthenticationProperties(Saml2Defaults.Scheme, "/SAML/Callback");
            return new ChallengeResult(Saml2Defaults.Scheme, properties);
        }

        public async Task<ActionResult> Logout()
        {
            await _signInManager.SignOutAsync();
            return SignOut(new AuthenticationProperties(){RedirectUri = "/Index"},Saml2Defaults.Scheme);            
        }

        public async Task<ActionResult> Callback()
        {
            var info = await _signInManager.GetExternalLoginInfoAsync();
            _signInManager.ClaimsFactory = new Saml2ClaimsFactory(_signInManager.ClaimsFactory, info,_personRepo);
            var result = await _signInManager.ExternalLoginSignInAsync(info.LoginProvider, info.ProviderKey, isPersistent: false, bypassTwoFactor: true);
            if (result.Succeeded)
            {
                _logger.LogInformation("{Name} logged in with {LoginProvider} provider.", info.Principal.Identity.Name, info.LoginProvider);
            }
            return Redirect("/index");
        }
    }
}