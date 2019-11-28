using Core.ApplicationServices;
using Core.ApplicationServices.Interfaces;
using Core.ApplicationServices.MailerService.Impl;
using Core.ApplicationServices.MailerService.Interface;
using Core.DomainModel;
using Core.DomainServices;
using Core.DomainServices.Interfaces;
using Core.DomainServices.RoutingClasses;
using Infrastructure.AddressServices;
using Infrastructure.AddressServices.Routing;
using Infrastructure.DataAccess;
using Infrastructure.KMDVacationService;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Pomelo.EntityFrameworkCore.MySql.Infrastructure;

namespace Presentation.Web.Config
{

    public static class DependencyInjection
    {
        public static IServiceCollection AddDependencies(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddDbContext<DataContext>(options => options.UseMySql(
                "Server=" + configuration["Database:Server"] + 
                ";Database=" + configuration["Database:Database"] + 
                ";Uid=" + configuration["Database:Uid"] + 
                ";Pwd=" + configuration["Database:Pwd"] + ";", 
                    mysqlOptions => mysqlOptions.ServerVersion(new System.Version(5, 6, 30), ServerType.MySql)).UseLazyLoadingProxies());
            services.AddTransient(typeof(IGenericRepository<>), typeof(GenericRepository<>));
            services.AddScoped<IPersonService, PersonService>();
            services.AddScoped<IMobileTokenService,MobileTokenService>();
            services.AddScoped<IMailSender,MailSender>();
            services.AddScoped<IMailService,MailService>();
            services.AddScoped<ISubstituteService,SubstituteService>();
            services.AddScoped<IAddressCoordinates, AddressCoordinates>();
            services.AddScoped<IRoute<RouteInformation>, BestRoute>();
            services.AddScoped<IReimbursementCalculator,ReimbursementCalculator>();
            services.AddScoped<ILicensePlateService,LicensePlateService>();
            services.AddScoped<IPersonalRouteService,PersonalRouteService>();
            services.AddScoped<IAddressLaunderer,AddressLaundering>();
            services.AddScoped<IOrgUnitService,OrgUnitService>();
            services.AddScoped<IAppLoginService,AppLoginService>();
            services.AddScoped<IReportService<Report>,ReportService<Report>>();
            services.AddScoped<IReportService<VacationReport>,VacationReportService>();
            services.AddScoped<IReportService<DriveReport>,DriveReportService>();
            services.AddScoped<IVacationReportService,VacationReportService>();
            services.AddScoped<IDriveReportService,DriveReportService>();
            services.AddScoped<IKMDAbsenceService,KMDAbsenceService>();
            services.AddScoped<IKMDAbsenceReportBuilder,KMDAbsenceReportBuilder>();
            services.AddScoped<APIService>();
            services.AddScoped<AddressHistoryService>();
            return services;
        }
    }
}
