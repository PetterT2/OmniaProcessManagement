using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Omnia.Fx.Models.Rollup;
using Omnia.Fx.Models.Shared;
using Omnia.Fx.Utilities;
using Omnia.ProcessManagement.Core.Services.ProcessRollup;
using Omnia.ProcessManagement.Models.Processes;
using Omnia.ProcessManagement.Models.ProcessRollup;
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
        public async ValueTask<ApiResponse<RollupProcessResult>> QueryProcessRollup([FromBody]RollupSetting setting)
        {
            try
            {
                var result = await ProcessRollupService.QueryProcessRollup(setting);
                return ApiUtils.CreateSuccessResponse(result);
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message);
                return ApiUtils.CreateErrorResponse<RollupProcessResult>(ex);
            }
        }
    }
}
