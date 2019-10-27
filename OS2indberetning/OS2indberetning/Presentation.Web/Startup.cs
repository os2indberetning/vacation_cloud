using Infrastructure.DataAccess;
using Microsoft.AspNet.OData.Extensions;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Presentation.Web.Config;
using Sustainsys.Saml2;
using Sustainsys.Saml2.Metadata;
using System.Security.Cryptography.X509Certificates;

namespace Presentation.Web
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddDependencies(Configuration);

            services.AddIdentity<IdentityUser, IdentityRole>().AddEntityFrameworkStores<DataContext>();

            services.AddOData();
            services.AddMvc(option => option.EnableEndpointRouting = false).SetCompatibilityVersion(CompatibilityVersion.Version_2_2)
                .AddJsonOptions(options => options.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore);        

            services.AddAuthentication()
                .AddSaml2(options =>
                {
                    options.SPOptions.EntityId = new EntityId("https://localhost:44342/Saml2");
                    options.IdentityProviders.Add(
                        new IdentityProvider(
                            new EntityId("http://demo-adfs.digital-identity.dk/adfs/services/trust"), options.SPOptions)
                            {
                                LoadMetadata = true
                                ,MetadataLocation = "https://demo-adfs.digital-identity.dk/FederationMetadata/2007-06/FederationMetadata.xml"
                        });
                    options.SPOptions.ServiceCertificates.Add(new X509Certificate2("samlKeystore.pfx", "Test1234"));

                });

        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseHsts();
            }

            app.UseHttpsRedirection();
            app.UseAuthentication();
            app.UseMvc(r => RouteConfig.Use(r));

            DefaultFilesOptions options = new DefaultFilesOptions();
            options.DefaultFileNames.Clear();
            options.DefaultFileNames.Add("/index.html");
            app.UseDefaultFiles(options);

            app.UseStaticFiles();
            app.UseFileServer(enableDirectoryBrowsing: false);
        }
    }
}