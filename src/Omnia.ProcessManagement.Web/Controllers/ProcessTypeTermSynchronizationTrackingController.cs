using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Omnia.Fx.Models.Shared;
using Omnia.Fx.Utilities;
using Omnia.ProcessManagement.Core.Services.ProcessTypes;
using Omnia.ProcessManagement.Models.ProcessTypes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Web.Controllers
{
    [Route("api/processtypetermsynchronizationtracking")]
    [ApiController]
    public class ProcessTypeTermSynchronizationTrackingController : ControllerBase
    {
        private IProcessTypeTermSynchronizationTrackingService ProcessTypeTermSynchronizationTrackingService { get; }
        private ILogger<ProcessTypeController> Logger { get; }

        public ProcessTypeTermSynchronizationTrackingController(IProcessTypeTermSynchronizationTrackingService processTypeTermSynchronizationTrackingService,
            ILogger<ProcessTypeController> logger
            )
        {
            Logger = logger;
            ProcessTypeTermSynchronizationTrackingService = processTypeTermSynchronizationTrackingService;
        }

        [HttpGet, Route("syncstatus")]
        [Authorize(Fx.Constants.Security.Roles.TenantAdmin)]
        public async ValueTask<ApiResponse<ProcessTypeTermSynchronizationStatus>> GetSyncStatusAsync(Guid termSetId)
        {
            try
            {
                var status = await ProcessTypeTermSynchronizationTrackingService.GetSyncStatusAsync(termSetId);
                return ApiUtils.CreateSuccessResponse(status);
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message);
                return ApiUtils.CreateErrorResponse<ProcessTypeTermSynchronizationStatus>(ex);
            }
        }

        [HttpPost, Route("triggersync")]
        [Authorize(Fx.Constants.Security.Roles.TenantAdmin)]
        public async ValueTask<ApiResponse> TriggerSyncAsync(Guid termSetId)
        {
            try
            {
                await ProcessTypeTermSynchronizationTrackingService.TriggerSyncAsync(termSetId, false);
                return ApiUtils.CreateSuccessResponse();
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message);
                return ApiUtils.CreateErrorResponse(ex);
            }
        }

        [HttpPost, Route("triggersyncfromsharepoint")]
        [Authorize(Fx.Constants.Security.Roles.TenantAdmin)]
        public async ValueTask<ApiResponse> TriggerSyncFromSharePointAsync(Guid termSetId)
        {
            try
            {
                await ProcessTypeTermSynchronizationTrackingService.TriggerSyncFromSharePointAsync(termSetId);
                return ApiUtils.CreateSuccessResponse();
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message);
                return ApiUtils.CreateErrorResponse(ex);
            }
        }
    }
}
