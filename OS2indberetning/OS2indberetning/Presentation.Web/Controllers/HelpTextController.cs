using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System;
using System.Linq;

namespace OS2Indberetning.Controllers
{
    [Route("api/[controller]")]
    public class HelpTextController : Controller
    {
        private IConfiguration _config;
        public HelpTextController(IConfiguration config)
        {
            _config = config;
        }

        // GET api/<controller>/5
        /// <summary>
        /// API Endpoint for getting help texts to be displayed in the frontend.
        /// HelpTexts are read from CustomSettings.config
        /// </summary>
        /// <param name="id">Returns the helptext identified by id</param>
        /// <returns>Help text</returns>
        [HttpGet("{id}")]
        public IActionResult Get(string id)
        {
            try
            {
                // Do not allow returning of keys that start with PROTECTED.
                if (id.IndexOf("PROTECTED", StringComparison.Ordinal) > -1)
                {
                    // If the key contains PROTECTED, then return forbidden.
                    return StatusCode(StatusCodes.Status403Forbidden);
                }
                // If the key doesnt contain protected, then return the result.
                var res = _config[id];
                return Ok(res);
            }
            catch (Exception e)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, e);
            }
        }

        /// <summary>
        /// Returns all help texts to cut down number of requests.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public IActionResult GetAll()
        {
            try
            {
                var res = _config.AsEnumerable().Where(kv => !kv.Key.Contains("PROTECTED")).ToList();
                return Ok(res);
            }
            catch (Exception e)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, e);
            }
        }
    }
}