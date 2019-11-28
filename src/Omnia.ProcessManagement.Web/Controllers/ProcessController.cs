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
using Omnia.Fx.Utilities;
using Omnia.ProcessManagement.Core.Services.Processes;
using Omnia.ProcessManagement.Core.Services.ProcessLibrary;
using Omnia.ProcessManagement.Models.Enums;
using Omnia.ProcessManagement.Models.ProcessActions;
using Omnia.ProcessManagement.Models.Processes;
using Omnia.ProcessManagement.Models.ProcessLibrary;

namespace Omnia.ProcessManagement.Web.Controllers
{
    [Route("api/processes")]
    [ApiController]
    public class ProcessController : ControllerBase
    {
        ILogger<ProcessController> Logger { get; }
        IProcessLibraryService ProcessLibraryService { get; }
        IProcessService ProcessService { get; }

        public ProcessController(IProcessService processService, ILogger<ProcessController> logger,
            IProcessLibraryService processLibraryService)
        {
            ProcessService = processService;
            ProcessLibraryService = processLibraryService;
            Logger = logger;
        }

        [HttpPost, Route("createdraft")]
        [Authorize]
        public async ValueTask<ApiResponse<Process>> CreateDraftProcessAsync([FromBody] ProcessActionModel actionModel)
        {
            try
            {
                LanguageTag language;
                (actionModel.Process.SiteId, actionModel.Process.WebId, language) = await ProcessLibraryService.GetProcessSiteInfo(actionModel.WebUrl);
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

        [HttpPost, Route("checkin/{opmProcessId:guid}")]
        [Authorize]
        public async ValueTask<ApiResponse<Process>> CheckInProcessAsync(Guid opmProcessId)
        {
            try
            {
                var process = await ProcessService.CheckInProcessAsync(opmProcessId);
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

        [HttpGet, Route("byprocessstep/{processStepId:guid}/{versionType:int}")]
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

        [HttpGet, Route("{processId:guid}")]
        [Authorize]
        public async ValueTask<ApiResponse<Process>> GetProcessByIdAsync(Guid processId)
        {
            try
            {
                var process = await ProcessService.GetProcessByIdAsync(processId);
                return process.AsApiResponse();
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message);
                return ApiUtils.CreateErrorResponse<Process>(ex);
            }
        }

        [HttpGet, Route("filteringoptions")]
        [Authorize]
        public async ValueTask<ApiResponse<List<string>>> GetFilteringOptions(string webUrl, string column)
        {
            try
            {
                var values = await ProcessLibraryService.GetFilterOptions(webUrl, column);
                return values.AsApiResponse();
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message);
                return ApiUtils.CreateErrorResponse<List<string>>(ex);
            }
        }

        [HttpPost, Route("drafts")]
        [Authorize]
        public async ValueTask<ApiResponse<DraftProcessesResponse>> GetDraftProcessesDataAsync([FromBody]ProcessLibraryRequest processLibraryRequest)
        {
            try
            {
                var processesData = await ProcessLibraryService.GetDraftProcessesDataAsync(processLibraryRequest);
                return processesData.AsApiResponse();
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message);
                return ApiUtils.CreateErrorResponse<DraftProcessesResponse>(ex);
            }
        }
    }
}