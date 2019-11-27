using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Omnia.Fx.Models.Shared;
using Omnia.Fx.Utilities;
using Omnia.ProcessManagement.Core.Services.Processes;
using Omnia.ProcessManagement.Models.Enums;
using Omnia.ProcessManagement.Models.ProcessActions;
using Omnia.ProcessManagement.Models.Processes;

namespace Omnia.ProcessManagement.Web.Controllers
{
    [Route("api/processes")]
    [ApiController]
    public class ProcessController : ControllerBase
    {
        ILogger<ProcessController> Logger { get; }
        IProcessService ProcessService { get; }
        public ProcessController(IProcessService processService, ILogger<ProcessController> logger)
        {
            ProcessService = processService;
            Logger = logger;
        }

        [HttpPost, Route("createdraft")]
        [Authorize]
        public async ValueTask<ApiResponse<Process>> CreateDraftProcessAsync([FromBody] ProcessActionModel actionModel)
        {
            try
            {
                var process = await ProcessService.CreateDraftProcessAsync(actionModel);
                return process.AsApiResponse();
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message);
                return ApiUtils.CreateErrorResponse<Process>(ex);
            }
        }

        [HttpDelete, Route("draft/{opmProcessId:guid}")]
        [Authorize]
        public async ValueTask<ApiResponse> DeleteDraftProcessAsync(Guid opmProcessId)
        {
            try
            {
                await ProcessService.DeleteDraftProcessAsync(opmProcessId);
                return ApiUtils.CreateSuccessResponse();
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message);
                return ApiUtils.CreateErrorResponse(ex);
            }
        }

        [HttpPost, Route("checkin")]
        [Authorize]
        public async ValueTask<ApiResponse<Process>> CheckInProcessAsync([FromBody] ProcessActionModel actionModel)
        {
            try
            {
                var process = await ProcessService.CheckInProcessAsync(actionModel);
                return process.AsApiResponse();
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message);
                return ApiUtils.CreateErrorResponse<Process>(ex);
            }
        }

        [HttpPost, Route("savecheckedout")]
        [Authorize]
        public async ValueTask<ApiResponse<Process>> SaveCheckedOutProcessAsync([FromBody] ProcessActionModel actionModel)
        {
            try
            {
                var process = await ProcessService.SaveCheckedOutProcessAsync(actionModel);
                return process.AsApiResponse();
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message);
                return ApiUtils.CreateErrorResponse<Process>(ex);
            }
        }

        [HttpPost, Route("checkout/{opmProcessId:guid}")]
        [Authorize]
        public async ValueTask<ApiResponse<Process>> CheckOutProcessAsync(Guid opmProcessId)
        {
            try
            {
                var process = await ProcessService.CheckOutProcessAsync(opmProcessId);
                return process.AsApiResponse();
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message);
                return ApiUtils.CreateErrorResponse<Process>(ex);
            }
        }

        [HttpPost, Route("discardchange/{opmProcessId:guid}")]
        [Authorize]
        public async ValueTask<ApiResponse<Process>> DiscardChangeProcessAsync(Guid opmProcessId)
        {
            try
            {
                var process = await ProcessService.DiscardChangeProcessAsync(opmProcessId);
                return process.AsApiResponse();
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message);
                return ApiUtils.CreateErrorResponse<Process>(ex);
            }
        }

        [HttpGet, Route("processdata/{processStepId:guid}/{hash}")]
        [Authorize]
        public async ValueTask<ApiResponse<ProcessDataWithAuditing>> GetProcessDataAsync(Guid processStepId, string hash)
        {
            try
            {
                var processData = await ProcessService.GetProcessDataAsync(processStepId, hash);

                //Response.GetTypedHeaders().CacheControl = new Microsoft.Net.Http.Headers.CacheControlHeaderValue()
                //{
                //    Public = true,
                //    MaxAge = TimeSpan.FromDays(31536000)
                //};

                return processData.AsApiResponse();
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message);
                return ApiUtils.CreateErrorResponse<ProcessDataWithAuditing>(ex);
            }
        }

        [HttpGet, Route("{processStepId:guid}/{versionType:int}")]
        [Authorize]
        public async ValueTask<ApiResponse<Process>> GetProcessByProcessStepIdAsync(Guid processStepId, ProcessVersionType versionType)
        {
            try
            {
                var processData = await ProcessService.GetProcessByProcessStepIdAsync(processStepId, versionType);
                return processData.AsApiResponse();
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message);
                return ApiUtils.CreateErrorResponse<Process>(ex);
            }
        }

        [HttpGet, Route("process/{processId:guid}")]
        [Authorize]
        public async ValueTask<ApiResponse<Process>> GetProcessById(Guid processId/*, ProcessVersionType versionType*/)
        {
            try
            {
                var process = await ProcessService.GetProcessById(processId, ProcessVersionType.Published);
                return process.AsApiResponse();
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message);
                return ApiUtils.CreateErrorResponse<Process>(ex);
            }
        }
    }
}