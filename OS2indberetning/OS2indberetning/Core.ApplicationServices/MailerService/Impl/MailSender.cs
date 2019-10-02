using System;
using System.Net;
using System.Net.Mail;
using Core.ApplicationServices.MailerService.Interface;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Core.ApplicationServices.MailerService.Impl
{
    public class MailSender : IMailSender
    {
        private readonly SmtpClient _smtpClient;
        private readonly ILogger _logger;
        private readonly IConfiguration _config;

        public MailSender(ILogger logger, IConfiguration config)
        {
            _logger = logger;
            _config = config;
            _smtpClient = new SmtpClient()
            {
                Host = _config["PROTECTED_SMTP_HOST"],
                Port = int.Parse(_config["PROTECTED_SMTP_HOST_PORT"]),
                EnableSsl = false,
                Credentials = new NetworkCredential()
                {
                    UserName = _config["PROTECTED_SMTP_USER"],
                    Password = _config["PROTECTED_SMTP_PASSWORD"]
                }

            };

        }

        /// <summary>
        /// Sends an email
        /// </summary>
        /// <param name="to">Email address of recipient.</param>
        /// <param name="subject">Subject of the email.</param>
        /// <param name="body">Body of the email.</param>
        public void SendMail(string to, string subject, string body)
        {
            if (String.IsNullOrWhiteSpace(to))
            {
                return;
            }
            var msg = new MailMessage();
            msg.To.Add(to);
            msg.From = new MailAddress(_config["PROTECTED_MAIL_FROM_ADDRESS"]);
            msg.Body = body;
            msg.Subject = subject;
            try
            {
                _smtpClient.Send(msg);
            }
            catch (Exception e )
            {
                _logger.LogError(e, "Fejl under afsendelse af mail. Mail er ikke afsendt.");
            }
        }
    }
}
