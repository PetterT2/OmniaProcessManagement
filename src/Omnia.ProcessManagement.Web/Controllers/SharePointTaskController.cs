using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Omnia.Fx.Contexts;
using Omnia.Fx.Models.Language;
using Omnia.Fx.Models.Shared;
using Omnia.Fx.Models.Users;
using Omnia.Fx.Users;
using Omnia.Fx.Utilities;
using Omnia.ProcessManagement.Core.Services.SharePoint;
using Omnia.ProcessManagement.Models.SharePointTasks;

namespace Omnia.ProcessManagement.Web.Controllers
{
    [Route("api/sharepointtasks")]
    [ApiController]
    public class SharePointTaskController : ControllerBase
    {
        ILogger<SharePointTaskController> Logger { get; }
        ISharePointTaskService SharePointTaskService { get; }

        public SharePointTaskController(ILogger<SharePointTaskController> logger,
            ISharePointTaskService sharePointTaskService)
        {
            Logger = logger;
            SharePointTaskService = sharePointTaskService;
        }


        [HttpPost, Route("getbygraph")]
        [Authorize]
        public async ValueTask<ApiResponse<GraphSharePointTaskResponse>> GetTasksByGraphAsync([FromBody] SharePointTaskRequest request)
        {
            try
            {
                var result = await SharePointTaskService.GetTasksByGraphApiAsync(request);
                return ApiUtils.CreateSuccessResponse(result);
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message);
                return ApiUtils.CreateErrorResponse<GraphSharePointTaskResponse>(ex);
            }
        }

        [HttpPost, Route("getbycsom")]
        [Authorize]
        public async ValueTask<ApiResponse<CSOMSharePointTaskResponse>> GetTasksByCSOMAsync([FromBody] SharePointTaskRequest request)
        {
            try
            {
                var result = await SharePointTaskService.GetTasksByCSOMAsync(request);
                return ApiUtils.CreateSuccessResponse(result);
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message);
                return ApiUtils.CreateErrorResponse<CSOMSharePointTaskResponse>(ex);
            }
        }
    }
}