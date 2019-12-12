using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Omnia.Fx.Models.Language;
using Omnia.Fx.Models.Shared;
using Omnia.Fx.Models.Users;
using Omnia.Fx.Utilities;
using Omnia.ProcessManagement.Core.Services.Processes;
using Omnia.ProcessManagement.Core.Services.ProcessLibrary;
using Omnia.ProcessManagement.Models.Enums;
using Omnia.ProcessManagement.Models.ProcessActions;
using Omnia.ProcessManagement.Models.Processes;
using Omnia.ProcessManagement.Models.ProcessLibrary;

namespace Omnia.ProcessManagement.Web.Controllers
{
    [Route("api/publish")]
    [ApiController]
    public class PublishProcessController : ControllerBase
    {
        ILogger<ProcessController> Logger { get; }
        IPublishProcessService PublishProcessService { get; }
       
        public PublishProcessController(ILogger<ProcessController> logger,
            IPublishProcessService publishProcessService)
        {
            PublishProcessService = publishProcessService;
            Logger = logger;
        }
        

        [HttpPost, Route("withoutapproval")]
        [Authorize]
        public async ValueTask<ApiResponse> PublishProcessWithoutApprovalAsync(PublishProcessWithoutApprovalRequest request)
        {
            try
            {
                await PublishProcessService.PublishProcessAsync(request);
                return ApiUtils.CreateSuccessResponse();
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message);
                return ApiUtils.CreateErrorResponse(ex);
            }
        }

        [HttpPost, Route("withapproval")]
        [Authorize]
        public async ValueTask<ApiResponse> PublishProcessWithApprovalAsync(PublishProcessWithApprovalRequest request)
        {
            try
            {
                await PublishProcessService.PublishProcessWithApprovalAsync(request);
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