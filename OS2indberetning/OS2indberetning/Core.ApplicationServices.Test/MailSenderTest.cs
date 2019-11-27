using Core.ApplicationServices.MailerService.Impl;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;
using NUnit.Framework;

namespace Core.ApplicationServices.Test
{
    [TestFixture]

    public class MailSenderTest
    {
        private IConfiguration config;

        [SetUp]
        public void Setup()
        {
            config = new ConfigurationBuilder().AddJsonFile("appsettings.json").Build();
        }

        [Test]
        public void Test1()
        {
            var mailSender = new MailSender(new NullLogger<MailSender>(), config);
            mailSender.SendMail("pso@digital-identity", "testsubject", "testbody");
        }
    }
}