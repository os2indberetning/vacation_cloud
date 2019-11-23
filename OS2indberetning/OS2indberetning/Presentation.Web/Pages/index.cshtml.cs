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
        public string Version { get; set; }
        public indexModel(IConfiguration Configuration)
        {
            Version = Configuration.GetValue<string>("Version");
        }

        public IActionResult OnGet()
        {
            if (!User.Identity.IsAuthenticated)
            {
                return Redirect("/SAML/Login");
            }
            return Page();
        }
    }
}