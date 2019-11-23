using Core.DomainModel;
using Core.DomainServices;
using Microsoft.AspNetCore.Identity;
using Sustainsys.Saml2;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Presentation.Web.Auth
{
    public class Saml2ClaimsFactory : IUserClaimsPrincipalFactory<IdentityPerson>
    {
        IUserClaimsPrincipalFactory<IdentityPerson> _inner;
        ExternalLoginInfo _externalLoginInfo;
        private readonly IGenericRepository<Person> _personRepo;

        public Saml2ClaimsFactory(
            IUserClaimsPrincipalFactory<IdentityPerson> inner,
            ExternalLoginInfo externalLoginInfo,
            IGenericRepository<Person> personRepo)
        {
            _inner = inner;
            _externalLoginInfo = externalLoginInfo;
            _personRepo = personRepo;
        }

        public async Task<ClaimsPrincipal> CreateAsync(IdentityPerson user)
        {

            user.Person.IsAdmin = _externalLoginInfo.Principal.Claims.Any(c => c.Type == "roles" && c.Value == "administrator");
            var email = _externalLoginInfo.Principal.Claims.Where(c => c.Type == "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress").FirstOrDefault();
            if (email != null)
            {
                user.Person.Mail = email.Value;
            }
            _personRepo.Update(user.Person);
            _personRepo.Save();

            var principal = await _inner.CreateAsync(user);

            var logoutInfo = _externalLoginInfo.Principal.FindFirst(Saml2ClaimTypes.LogoutNameIdentifier);
            var sessionIndex = _externalLoginInfo.Principal.FindFirst(Saml2ClaimTypes.SessionIndex);

            var identity = principal.Identities.Single();
            identity.AddClaim(logoutInfo);
            identity.AddClaim(sessionIndex);
            return principal;
        }
    }
}
