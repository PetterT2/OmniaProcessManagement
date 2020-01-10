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
using Omnia.Fx.Models.Rollup;
using Omnia.Fx.Models.Shared;
using Omnia.Fx.Utilities;
using Omnia.ProcessManagement.Core.Services.Processes;
using Omnia.ProcessManagement.Core.Services.Security;
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

        [HttpPost, Route("createdraft/{opmProcessId:guid}")]
        [Authorize]
        public async ValueTask<ApiResponse<Process>> CreateDraftProcessAsync(Guid opmProcessId)
        {
            try
            {
                var securityResponse = await ProcessSecurityService.InitSecurityResponseByOPMProcessIdAsync(opmProcessId, ProcessVersionType.Published);

                return await securityResponse.RequireAuthor()
                    .DoAsync(async () =>
                    {
                        var process = await ProcessService.CreateDraftProcessAsync(opmProcessId);
                        return process.AsApiResponse();
                    });
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message);
                return ApiUtils.CreateErrorResponse<Process>(ex);
            }
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
        public async ValueTask<ApiResponse<ProcessData>> GetProcessDataAsync(Guid processStepId, string hash, ProcessVersionType versionType)
        {
            try
            {
                var securityResponse = await ProcessSecurityService.InitSecurityResponseByProcessStepIdAsync(processStepId, hash, versionType);

                return await securityResponse
                    .RequireAuthor()
                    .OrRequireReviewer(ProcessVersionType.CheckedOut, ProcessVersionType.Draft)
                    .OrRequireApprover(ProcessVersionType.Draft)
                    .OrRequireReader(ProcessVersionType.Published)
                    .DoAsync(async () =>
                    {
                        var processData = await ProcessService.GetProcessDataAsync(processStepId, hash, versionType);


                        //For published version, we can cache the value like forever
                        //For the draft/checked-out version, since it could be changed frequently so we just need to cache the value in a short time
                        Response.GetTypedHeaders().CacheControl = new Microsoft.Net.Http.Headers.CacheControlHeaderValue()
                        {
                            Public = true,
                            MaxAge = versionType == ProcessVersionType.Published || versionType == ProcessVersionType.Archived ? TimeSpan.FromDays(365) : TimeSpan.FromDays(1)
                        };


                        return processData.AsApiResponse();
                    });
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message);
                return ApiUtils.CreateErrorResponse<ProcessData>(ex);
            }
        }

        [HttpPost, Route("draft/workingstatus")]
        [Authorize]
        public async ValueTask<ApiResponse<Dictionary<Guid, ProcessWorkingStatus>>> GetDraftProcessWorkingStatusAsync(List<Guid> opmProcessIds, Guid teamAppId)
        {
            try
            {
                var authorizedProcessQuery = await ProcessSecurityService.InitAuthorizedProcessByVersionQueryAsync(DraftOrPublishedVersionType.Draft,
                     limitedTeamAppIds: new List<Guid> { teamAppId },
                     limitedOPMProcessIds: opmProcessIds);

                var processWorkingStatus = await ProcessService.GetProcessWorkingStatusAsync(authorizedProcessQuery);
                return processWorkingStatus.AsApiResponse();
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message);
                return ApiUtils.CreateErrorResponse<Dictionary<Guid, ProcessWorkingStatus>>(ex);
            }
        }

        [HttpPost, Route("published/workingstatus")]
        [Authorize]
        public async ValueTask<ApiResponse<Dictionary<Guid, ProcessWorkingStatus>>> GetPublishedProcessWorkingStatusAsync(List<Guid> opmProcessIds, Guid teamAppId)
        {
            try
            {
                var authorizedProcessQuery = await ProcessSecurityService.InitAuthorizedProcessByVersionQueryAsync(DraftOrPublishedVersionType.Published,
                    limitedTeamAppIds: new List<Guid> { teamAppId },
                    limitedOPMProcessIds: opmProcessIds);

                var processWorkingStatus = await ProcessService.GetProcessWorkingStatusAsync(authorizedProcessQuery);
                return processWorkingStatus.AsApiResponse();
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message);
                return ApiUtils.CreateErrorResponse<Dictionary<Guid, ProcessWorkingStatus>>(ex);
            }
        }

        [HttpGet, Route("byprocessstep/{processStepId:guid}")]
        [Authorize]
        public async ValueTask<ApiResponse<Process>> GetPublishedProcessByProcessStepIdAsync(Guid processStepId)
        {
            try
            {
                var securityResponse = await ProcessSecurityService.InitSecurityResponseByProcessStepIdAsync(processStepId, ProcessVersionType.Published);

                return await securityResponse
                    .RequireAuthor()
                    .OrRequireReader()
                    .DoAsync(async () =>
                    {
                        var processData = await ProcessService.GetProcessByProcessStepIdAsync(processStepId, ProcessVersionType.Published);
                        return processData.AsApiResponse();
                    });
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message);
                return ApiUtils.CreateErrorResponse<Process>(ex);
            }
        }

        [HttpGet, Route("byprocessstep/{processStepId:guid}/preview")]
        [Authorize]
        public async ValueTask<ApiResponse<Process>> GetPreviewProcessByProcessStepIdAsync(Guid processStepId)
        {
            try
            {
                var authorizedProcessQuery = await ProcessSecurityService.InitAuthorizedProcessByProcessStepIdQueryAsync(processStepId);
                var processes = await ProcessService.GetAuthorizedProcessesAsync(authorizedProcessQuery);

                var process = processes.FirstOrDefault(p => p.VersionType == ProcessVersionType.CheckedOut);
                if (process == null)
                {
                    process = processes.FirstOrDefault(p => p.VersionType == ProcessVersionType.Draft);
                }
                if (process == null)
                {
                    process = processes.FirstOrDefault(p => p.VersionType == ProcessVersionType.Published);
                }

                if (process == null)
                    throw new Exception($"Unauthorized or process step id: {processStepId} not found");

                return process.AsApiResponse();
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
                    .OrRequireApprover(ProcessVersionType.Draft)
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

        [HttpGet, Route("draft")]
        [Authorize]
        public async ValueTask<ApiResponse<List<Process>>> GetDraftProcessesAsync(Guid teamAppId)
        {
            try
            {
                var authorizedProcessQuery = await ProcessSecurityService.InitAuthorizedProcessByVersionQueryAsync(DraftOrPublishedVersionType.Draft,
                    limitedTeamAppIds: new List<Guid> { teamAppId });

                var processesData = await ProcessService.GetAuthorizedProcessesAsync(authorizedProcessQuery);
                return processesData.AsApiResponse();
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message);
                return ApiUtils.CreateErrorResponse<List<Process>>(ex);
            }
        }

        [HttpGet, Route("published")]
        [Authorize]
        public async ValueTask<ApiResponse<List<Process>>> GetPublishedProcessesAsync(Guid teamAppId)
        {
            try
            {
                var authorizedProcessQuery = await ProcessSecurityService.InitAuthorizedProcessByVersionQueryAsync(DraftOrPublishedVersionType.Published,
                    limitedTeamAppIds: new List<Guid> { teamAppId });

                var processesData = await ProcessService.GetAuthorizedProcessesAsync(authorizedProcessQuery);
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
                       var beingUsed = await ProcessService.CheckIfDeletingProcessStepsAreBeingUsedAsync(processId, deletingProcessStepIds);
                       return beingUsed.AsApiResponse();
                   });
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message);
                return ApiUtils.CreateErrorResponse<bool>(ex);
            }
        }

        [HttpPost, Route("sync/{opmProcessId:guid}")]
        [Authorize]
        public async ValueTask<ApiResponse> TriggerSyncToSharePointAsync(Guid opmProcessId)
        {
            try
            {
                var securityResponse = await ProcessSecurityService.InitSecurityResponseByOPMProcessIdAsync(opmProcessId, ProcessVersionType.Published);

                return await securityResponse
                   .RequireAuthor()
                   .DoAsync(async () =>
                   {
                       await ProcessService.UpdatePublishedProcessWorkingStatusAsync(opmProcessId, ProcessWorkingStatus.SyncingToSharePoint);
                       return ApiUtils.CreateSuccessResponse();
                   });
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message);
                return ApiUtils.CreateErrorResponse(ex);
            }
        }

        [HttpPost, Route("triggerarchive/{opmProcessId:guid}")]
        [Authorize]
        public async ValueTask<ApiResponse> TriggerArchiveAsync(Guid opmProcessId)
        {
            try
            {
                var securityResponse = await ProcessSecurityService.InitSecurityResponseByOPMProcessIdAsync(opmProcessId, ProcessVersionType.Published);

                return await securityResponse
                   .RequireAuthor()
                   .DoAsync(async () =>
                   {
                       await ProcessService.UpdatePublishedProcessWorkingStatusAsync(opmProcessId, ProcessWorkingStatus.Archiving);
                       return ApiUtils.CreateSuccessResponse();
                   });
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message);
                return ApiUtils.CreateErrorResponse(ex);
            }
        }

        [HttpGet, Route("checkifdraftexist/{opmProcessId:guid}")]
        [Authorize]
        public async ValueTask<ApiResponse<bool>> CheckIfDraftExist(Guid opmProcessId)
        {
            try
            {
                var result = await ProcessService.CheckIfDraftExist(opmProcessId);
                return ApiUtils.CreateSuccessResponse(result);
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message);
                return ApiUtils.CreateErrorResponse<bool>(ex);
            }
        }
    }
}