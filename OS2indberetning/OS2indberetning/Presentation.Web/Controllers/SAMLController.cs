using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

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
            var properties = _signInManager.ConfigureExternalAuthenticationProperties(provider, "/SAML/CallBack");
            return new ChallengeResult(provider, properties);
        }

        public async Task<IActionResult> Callback()
        {
            var info = await _signInManager.GetExternalAuthenticationSchemesAsync();

            return Ok("foo");
        }
    }
}