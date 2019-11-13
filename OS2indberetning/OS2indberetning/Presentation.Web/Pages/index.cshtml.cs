using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Configuration;
using System.Threading.Tasks;

namespace Presentation.Web.Pages
{
    public class indexModel : PageModel
    {
        private readonly SignInManager<IdentityUser> _signInManager;
        public string Version { get; set; }
        public indexModel(SignInManager<IdentityUser> signInManager, IConfiguration Configuration)
        {
            _signInManager = signInManager;
            Version = Configuration.GetValue<string>("Version");
        }

        public async Task<IActionResult> OnGetAsync()
        {
            // AuthorizeAttribute apparently not working with returnurl, so issuing challenge manually instead 
            var info = await _signInManager.GetExternalLoginInfoAsync();
            if (info == null)
            {
                var provider = "Saml2";
                var properties = _signInManager.ConfigureExternalAuthenticationProperties(provider, "/");
                return new ChallengeResult(provider, properties);
            }
            return Page();
        }
    }
}