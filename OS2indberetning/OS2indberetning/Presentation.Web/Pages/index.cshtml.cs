using Microsoft.AspNetCore.Http;
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

        public IActionResult OnGet()
        {
            if (!HttpContext.Session.GetInt32("personId").HasValue)
            {
                return Redirect("/SAML/Login");
            }
            return Page();
        }
    }
}