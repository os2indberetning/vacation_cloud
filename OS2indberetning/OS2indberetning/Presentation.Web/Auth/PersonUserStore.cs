using Core.DomainModel;
using Core.DomainServices;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Presentation.Web.Auth
{
    public class PersonUserStore : IUserStore<IdentityPerson>, IUserLoginStore<IdentityPerson>
    {
        private readonly IGenericRepository<Person> _personRepo;

        public PersonUserStore(IGenericRepository<Person> personRepo)
        {
            _personRepo = personRepo;
        }

        public Task AddLoginAsync(IdentityPerson user, UserLoginInfo login, CancellationToken cancellationToken)
        {
            throw new NotImplementedException();
        }

        public Task<IdentityResult> CreateAsync(IdentityPerson user, CancellationToken cancellationToken)
        {
            throw new NotImplementedException();
        }

        public Task<IdentityResult> DeleteAsync(IdentityPerson user, CancellationToken cancellationToken)
        {
            throw new NotImplementedException();
        }

        public void Dispose()
        {
        }

        public Task<IdentityPerson> FindByIdAsync(string userId, CancellationToken cancellationToken)
        {
            var person = _personRepo.AsQueryable().FirstOrDefault(p => p.Id == int.Parse(userId));
            if (person == null)
            {
                throw new UnauthorizedAccessException("Bruger ikke fundet i databasen.");
            }
            return Task.FromResult(new IdentityPerson(person));
        }

        public Task<IdentityPerson> FindByLoginAsync(string loginProvider, string providerKey, CancellationToken cancellationToken)
        {
            var person = _personRepo.AsQueryable().FirstOrDefault(p => p.CprNumber.Equals(providerKey.Replace("-", "")));
            if (person == null)
            {
                throw new UnauthorizedAccessException("Bruger ikke fundet i databasen.");
            }
            if (!person.IsActive)
            {
                throw new UnauthorizedAccessException("Inaktiv bruger forsøgte at logge ind.");
            }
            return Task.FromResult(new IdentityPerson(person));
        }

        public Task<IdentityPerson> FindByNameAsync(string normalizedUserName, CancellationToken cancellationToken)
        {
            throw new NotImplementedException();
        }

        public Task<IList<UserLoginInfo>> GetLoginsAsync(IdentityPerson user, CancellationToken cancellationToken)
        {
            throw new NotImplementedException();
        }

        public Task<string> GetNormalizedUserNameAsync(IdentityPerson user, CancellationToken cancellationToken)
        {
            throw new NotImplementedException();
        }

        public Task<string> GetUserIdAsync(IdentityPerson user, CancellationToken cancellationToken)
        {
            return Task.FromResult(user.Person.Id.ToString());
        }

        public Task<string> GetUserNameAsync(IdentityPerson user, CancellationToken cancellationToken)
        {
            return Task.FromResult(user.Person.FullName);
        }

        public Task RemoveLoginAsync(IdentityPerson user, string loginProvider, string providerKey, CancellationToken cancellationToken)
        {
            throw new NotImplementedException();
        }

        public Task SetNormalizedUserNameAsync(IdentityPerson user, string normalizedName, CancellationToken cancellationToken)
        {
            throw new NotImplementedException();
        }

        public Task SetUserNameAsync(IdentityPerson user, string userName, CancellationToken cancellationToken)
        {
            throw new NotImplementedException();
        }

        public Task<IdentityResult> UpdateAsync(IdentityPerson user, CancellationToken cancellationToken)
        {
            throw new NotImplementedException();
        }
    }
}
