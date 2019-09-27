using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Core.DomainModel;
using Core.DomainServices;
using Microsoft.AspNetCore.Mvc;

namespace Presentation.Web.Controllers
{
    [Route("api/[controller]")]
    public class SampleDataController : Controller
    {
        private readonly IGenericRepository<Person> _personRepo;

        public SampleDataController(IGenericRepository<Person> personRepo)
        {
            _personRepo = personRepo;
        }

        private static string[] Summaries = new[]
        {
            "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
        };

        [HttpGet("[action]")]
        public IEnumerable<WeatherForecast> WeatherForecasts()
        {
            Person p = new Person();
            p.FirstName = "Peter";
            p.LastName = "Søgaard";
            p.FullName = "Peter Søgaard";
            p.Mail = "pso@digital-identity.dk";
            p.Initials = "pso";
            p.CprNumber = "0123456789";
            _personRepo.Insert(p);
            _personRepo.Save();

            var rng = new Random();
            return Enumerable.Range(1, 5).Select(index => new WeatherForecast
            {
                DateFormatted = DateTime.Now.AddDays(index).ToString("d"),
                TemperatureC = rng.Next(-20, 55),
                Summary = Summaries[rng.Next(Summaries.Length)]
            });
        }

        public class WeatherForecast
        {
            public string DateFormatted { get; set; }
            public int TemperatureC { get; set; }
            public string Summary { get; set; }

            public int TemperatureF
            {
                get
                {
                    return 32 + (int)(TemperatureC / 0.5556);
                }
            }
        }
    }
}
