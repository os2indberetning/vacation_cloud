using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace OS2Indberetning.Controllers
{
    [Route("[controller]/[action]")]
    public class SAMLController : Controller
    {
        private readonly SignInManager<IdentityUser> _signInManager;

        public SAMLController(SignInManager<IdentityUser> signInManager)
        {
            _signInManager = signInManager;
        }

        public IActionResult Login()
        {
            var provider = "Saml2";
            var properties = _signInManager.ConfigureExternalAuthenticationProperties(provider, "/");
            return new ChallengeResult(provider, properties);
        }
    }
}