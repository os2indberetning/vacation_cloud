using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Sustainsys.Saml2;
using Sustainsys.Saml2.Metadata;
using System.Security.Cryptography.X509Certificates;

namespace Presentation.Web.Config
{

    public static class SAMLConfig
    {
        public static IServiceCollection AddSAMLAuthentication(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddAuthentication()
                .AddSaml2(options =>
                {
                    ;
                    options.SPOptions.EntityId = new EntityId(configuration["SAML:EntityId"]);
                    options.IdentityProviders.Add(
                        new IdentityProvider(
                            new EntityId(configuration["SAML:IdpEntityId"]), options.SPOptions)
                        {
                            LoadMetadata = true
                            ,MetadataLocation = configuration["SAML:IdpMetadataLocation"]
                        });
                    options.SPOptions.ServiceCertificates.Add(new X509Certificate2(configuration["SAML:CertificateFilename"], configuration["SAML:CertificatePassword"]));
                });
            return services;
        }
    }
}