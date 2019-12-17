using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Omnia.Fx.Apps;
using Omnia.Fx.Models.Language;
using Omnia.Fx.Models.Shared;
using Omnia.Fx.Models.Users;
using Omnia.Fx.Utilities;
using Omnia.ProcessManagement.Core.Services.Processes;
using Omnia.ProcessManagement.Core.Services.ProcessLibrary;
using Omnia.ProcessManagement.Core.Services.Security;
using Omnia.ProcessManagement.Core.Services.SharePoint;
using Omnia.ProcessManagement.Core.Services.TeamCollaborationApps;
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
        IProcessSecurityService ProcessSecurityService { get; }

        public ProcessController(IProcessService processService, ILogger<ProcessController> logger, IProcessSecurityService processSecurityService)
        {
            ProcessService = processService;
            ProcessSecurityService = processSecurityService;
            Logger = logger;
        }

        [HttpPost, Route("createdraft")]
        [Authorize]
        public async ValueTask<ApiResponse<Process>> CreateDraftProcessAsync([FromBody] ProcessActionModel actionModel)
        {
            try
            {
                return await ProcessSecurityService.InitSecurityResponseByTeamAppId(actionModel.Process.TeamAppId)
                    .RequireAuthor()
                    .DoAsync(async () =>
                    {
                        var process = await ProcessService.CreateDraftProcessAsync(actionModel);
                        return process.AsApiResponse();
                    });
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
                var securityResponse = await ProcessSecurityService.InitSecurityResponseByOPMProcessIdAsync(opmProcessId, ProcessVersionType.Draft);

                return await securityResponse.RequireAuthor()
                    .DoAsync(async () =>
                {
                    await ProcessService.DeleteDraftProcessAsync(opmProcessId);
                    return ApiUtils.CreateSuccessResponse();
                });
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
                var securityResponse = await ProcessSecurityService.InitSecurityResponseByOPMProcessIdAsync(opmProcessId, ProcessVersionType.CheckedOut);

                return await securityResponse
                    .RequireAuthor()
                    .OrRequireReviewer()
                    .DoAsync(async () =>
                {
                    var process = await ProcessService.CheckInProcessAsync(opmProcessId);
                    return process.AsApiResponse();
                });
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
                var securityResponse = await ProcessSecurityService.InitSecurityResponseByOPMProcessIdAsync(actionModel.Process.OPMProcessId, ProcessVersionType.Draft);

                return await securityResponse
                    .RequireAuthor()
                    .OrRequireReviewer()
                    .DoAsync(async () =>
                    {
                        var process = await ProcessService.SaveCheckedOutProcessAsync(actionModel);
                        return process.AsApiResponse();
                    });
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
                var securityResponse = await ProcessSecurityService.InitSecurityResponseByOPMProcessIdAsync(opmProcessId, ProcessVersionType.Draft);

                return await securityResponse
                    .RequireAuthor()
                    .OrRequireReviewer()
                    .DoAsync(async () =>
                    {
                        var process = await ProcessService.CheckOutProcessAsync(opmProcessId);
                        return process.AsApiResponse();
                    });
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
                var securityResponse = await ProcessSecurityService.InitSecurityResponseByOPMProcessIdAsync(opmProcessId, ProcessVersionType.CheckedOut);

                return await securityResponse
                    .RequireAuthor()
                    .OrRequireReviewer()
                    .DoAsync(async () =>
                    {
                        var process = await ProcessService.DiscardChangeProcessAsync(opmProcessId);
                        return process.AsApiResponse();
                    });
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message);
                return ApiUtils.CreateErrorResponse<Process>(ex);
            }
        }

        [HttpGet, Route("processdata/{processStepId:guid}/{hash}/{versionType:int}")]
        [Authorize]
        public async ValueTask<ApiResponse<ProcessDataWithAuditing>> GetProcessDataAsync(Guid processStepId, string hash, ProcessVersionType versionType)
        {
            try
            {
                var securityResponse = await ProcessSecurityService.InitSecurityResponseByProcessStepIdAsync(processStepId, hash, versionType);

                return await securityResponse
                    .RequireAuthor()
                    .OrRequireReviewer(ProcessVersionType.CheckedOut, ProcessVersionType.Draft)
                    .OrRequireApprover(ProcessVersionType.CheckedOut, ProcessVersionType.Draft)
                    .OrRequireReader(ProcessVersionType.LatestPublished)
                    .DoAsync(async () =>
                    {
                        var processData = await ProcessService.GetProcessDataAsync(processStepId, hash, versionType);


                        //For published version, we can cache the value like forever
                        //For the draft/checked-out version, since it could be changed frequently so we just need to cache the value in a short time
                        Response.GetTypedHeaders().CacheControl = new Microsoft.Net.Http.Headers.CacheControlHeaderValue()
                        {
                            Public = true,
                            MaxAge = versionType == ProcessVersionType.LatestPublished || versionType == ProcessVersionType.Published ? TimeSpan.FromDays(365) : TimeSpan.FromDays(1)
                        };


                        return processData.AsApiResponse();
                    });
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message);
                return ApiUtils.CreateErrorResponse<ProcessDataWithAuditing>(ex);
            }
        }

        [HttpPost, Route("workingstatus/{versionType:int}")]
        [Authorize]
        public async ValueTask<ApiResponse<List<ProcessWorkingStatus>>> GetProcessWorkingStatusAsync(List<Guid> opmProcessIds, ProcessVersionType versionType)
        {
            try
            {
                var processWorkingStatus = await ProcessService.GetProcessWorkingStatusAsync(opmProcessIds, versionType);
                return processWorkingStatus.AsApiResponse();
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message);
                return ApiUtils.CreateErrorResponse<List<ProcessWorkingStatus>>(ex);
            }
        }

        [HttpGet, Route("byprocessstep/{processStepId:guid}/{versionType:int}")]
        [Authorize]
        public async ValueTask<ApiResponse<Process>> GetProcessByProcessStepIdAsync(Guid processStepId, ProcessVersionType versionType)
        {
            try
            {
                var securityResponse = await ProcessSecurityService.InitSecurityResponseByProcessStepIdAsync(processStepId, versionType);

                return await securityResponse
                    .RequireAuthor()
                    .OrRequireReviewer(ProcessVersionType.CheckedOut, ProcessVersionType.Draft)
                    .OrRequireApprover(ProcessVersionType.CheckedOut, ProcessVersionType.Draft)
                    .OrRequireReader(ProcessVersionType.Published)
                    .DoAsync(async () =>
                    {
                        var processData = await ProcessService.GetProcessByProcessStepIdAsync(processStepId, versionType);
                        return processData.AsApiResponse();
                    });
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
                var securityResponse = await ProcessSecurityService.InitSecurityResponseByProcessIdAsync(processId);

                return await securityResponse
                    .RequireAuthor()
                    .OrRequireReviewer(ProcessVersionType.CheckedOut, ProcessVersionType.Draft)
                    .OrRequireApprover(ProcessVersionType.CheckedOut, ProcessVersionType.Draft)
                    .OrRequireReader(ProcessVersionType.Published)
                    .DoAsync(async () =>
                    {
                        var process = await ProcessService.GetProcessByIdAsync(processId);
                        return process.AsApiResponse();
                    });
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message);
                return ApiUtils.CreateErrorResponse<Process>(ex);
            }
        }

        [HttpGet, Route("all")]
        [Authorize]
        public async ValueTask<ApiResponse<List<Process>>> GetProcessesAsync(ProcessVersionType versionType, Guid teamAppId)
        {
            try
            {
                var processesData = await ProcessService.GetProcessesAsync(teamAppId, versionType);
                return processesData.AsApiResponse();
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message);
                return ApiUtils.CreateErrorResponse<List<Process>>(ex);
            }
        }

        [HttpPost, Route("checkifdeletingprocessstepsarebeingused/{processId:guid}")]
        [Authorize]
        public async ValueTask<ApiResponse<bool>> CheckIfDeletingProcessStepsAreBeingUsed(Guid processId, List<Guid> deletingProcessStepIds)
        {
            try
            {
                var securityResponse = await ProcessSecurityService.InitSecurityResponseByProcessIdAsync(processId);

                return await securityResponse
                   .RequireAuthor()
                   .OrRequireReviewer(ProcessVersionType.CheckedOut)
                   .DoAsync(async () =>
                   {
                       var beingUsed = await ProcessService.CheckIfDeletingProcessStepsAreBeingUsed(processId, deletingProcessStepIds);
                       return beingUsed.AsApiResponse();
                   });
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message);
                return ApiUtils.CreateErrorResponse<bool>(ex);
            }
        }
    }
}