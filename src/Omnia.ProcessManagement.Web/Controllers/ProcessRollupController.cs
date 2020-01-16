using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Omnia.Fx.Models.Rollup;
using Omnia.Fx.Utilities;
using Omnia.ProcessManagement.Core.Services.ProcessRollup;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Web.Controllers
{
    [Route("api/processrollup")]
    public class ProcessRollupController : ControllerBase
    {
        ILogger<ProcessRollupController> Logger { get; }
        IProcessRollupService ProcessRollupService { get; }

        public ProcessRollupController(ILogger<ProcessRollupController> logger, IProcessRollupService processRollupService) 
        {
            Logger = logger;
            ProcessRollupService = processRollupService;
        }

        [HttpPost, Route("queryrollup")]
        [Authorize]
        public async ValueTask<IActionResult> QueryProcessRollup([FromBody]RollupSetting setting)
        {
            try
            {

                var result = await ProcessRollupService.QueryProcessRollup(setting);
                return Ok(ApiUtils.CreateSuccessResponse(result));
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, $"Failed to {nameof(QueryProcessRollup)}");
                return Ok(ApiUtils.CreateErrorResponse(ex));
            }
        }
    }
}
