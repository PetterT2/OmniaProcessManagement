﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Omnia.Fx.Contexts;
using Omnia.Fx.Models.Shared;
using Omnia.Fx.SharePoint.Client;
using Omnia.Fx.SharePoint.Client.Core;
using Omnia.Fx.Utilities;
using Omnia.ProcessManagement.Core;
using Omnia.ProcessManagement.Core.Helpers.Processes;
using Omnia.ProcessManagement.Core.Helpers.ProcessQueries;
using Omnia.ProcessManagement.Core.Services.Processes;
using Omnia.ProcessManagement.Core.Services.Security;
using Omnia.ProcessManagement.Core.Services.TeamCollaborationApps;
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
        IProcessService ProcessService { get; }
        IProcessSecurityService ProcessSecurityService { get; }
        ISharePointClientContextProvider SharePointClientContextProvider { get; }
        ITeamCollaborationAppsService TeamCollaborationAppService { get; }
        IOmniaContext OmniaContext { get; }

        public ProcessController(IProcessService processService, ILogger<ProcessController> logger, IProcessSecurityService processSecurityService,
            IOmniaContext omniaContext, ITeamCollaborationAppsService teamCollaborationAppService, ISharePointClientContextProvider sharePointClientContextProvider)
        {
            ProcessService = processService;
            ProcessSecurityService = processSecurityService;
            OmniaContext = omniaContext;
            Logger = logger;
            TeamCollaborationAppService = teamCollaborationAppService;
            SharePointClientContextProvider = sharePointClientContextProvider;
        }

        [HttpGet, Route("checkoutinfo/{opmProcessId:guid}")]
        [Authorize]
        public async ValueTask<ApiResponse<ProcessCheckoutInfo>> GetProcessCheckoutInfoAsync(Guid opmProcessId)
        {
            try
            {
                var authorizedProcessQuery = await ProcessSecurityService.InitAuthorizedProcessByOPMProcessIdQueryAsync(opmProcessId);
                var processes = await ProcessService.GetAuthorizedProcessesAsync(authorizedProcessQuery);

                var draftProcess = processes.FirstOrDefault(p => p.VersionType == ProcessVersionType.Draft);

                var checkoutInfo = GenerateProcessCheckoutInfo(authorizedProcessQuery, draftProcess);

                return checkoutInfo.AsApiResponse();
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message);
                return ApiUtils.CreateErrorResponse<ProcessCheckoutInfo>(ex);
            }
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
        public async ValueTask<ApiResponse<Process>> CheckOutProcessAsync(Guid opmProcessId, bool takeControl)
        {
            try
            {
                var securityResponse = await ProcessSecurityService.InitSecurityResponseByOPMProcessIdAsync(opmProcessId, ProcessVersionType.Draft);

                return await securityResponse
                    .RequireAuthor()
                    .OrRequireReviewer()
                    .DoAsync(async () =>
                    {
                        var process = await ProcessService.CheckOutProcessAsync(opmProcessId, takeControl);
                        return process.AsApiResponse();
                    });
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message);
                return ApiUtils.CreateErrorResponse<Process>(ex);
            }
        }


        [HttpPost, Route("copytonewprocess/{opmProcessId:guid}/{processStepId:guid}")]
        [Authorize]
        public async ValueTask<ApiResponse<Process>> CopyToNewProcessAsync(Guid opmProcessId, Guid processStepId)
        {
            try
            {
                var securityResponse = await ProcessSecurityService.InitSecurityResponseByOPMProcessIdAsync(opmProcessId, ProcessVersionType.Draft);

                return await securityResponse
                    .RequireAuthor()
                    .OrRequireReviewer()
                    .DoAsync(async () =>
                    {
                        var process = await ProcessService.CopyToNewProcessAsync(opmProcessId, processStepId);
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

        [HttpGet, Route("{opmProcessId:guid}/processdata/{processStepId:guid}/{hash}")]
        [Authorize]
        public async ValueTask<ApiResponse<ProcessData>> GetProcessDataAsync(Guid opmProcessId, Guid processStepId, string hash)
        {
            try
            {
                var securityResponse = await ProcessSecurityService.InitSecurityResponseByProcessStepIdAsync(opmProcessId, processStepId, hash);
                var processDataValueTask = ProcessService.GetProcessDataAsync(processStepId, hash);

                return await securityResponse
                    .RequireAuthor()
                    .OrRequireReviewer()
                    .OrRequireApprover()
                    .OrRequireReader(ProcessVersionType.Archived, ProcessVersionType.Published)
                    .DoAsync(async (teamAppId, opmProcessId, versionType) =>
                    {

                        var processData = await processDataValueTask;

                        //For published/archived version, we can cache the value like forever
                        //For the draft/checked-out version, since it could be changed frequently so we just need to cache the value in a short time. 
                        //Note that the hash will be changed if draft/checked-out data change so its safe to cache them in a short time
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

        //[HttpGet, Route("test1/{opmProcessId:guid}/processdata/{processStepId:guid}/{hash}")]
        //[Authorize]
        //public async ValueTask<ApiResponse<ProcessData>> Test1Async(Guid opmProcessId, Guid processStepId, string hash)
        //{
        //    try
        //    {
        //        var securityResponse = await ProcessSecurityService.InitSecurityResponseByProcessStepIdAsync(opmProcessId, processStepId, hash);
        //        var processData = await ProcessService.GetProcessDataAsync(processStepId, hash);
        //        return processData.AsApiResponse();
        //    }
        //    catch (Exception ex)
        //    {
        //        Logger.LogError(ex, ex.Message);
        //        return ApiUtils.CreateErrorResponse<ProcessData>(ex);
        //    }
        //}

        //[HttpGet, Route("test2/{opmProcessId:guid}/processdata/{processStepId:guid}/{hash}")]
        //[Authorize]
        //public async ValueTask<ApiResponse<ProcessData>> Test2Async(Guid opmProcessId, Guid processStepId, string hash)
        //{
        //    try
        //    {
        //        var processData = await ProcessService.GetProcessDataAsync(processStepId, hash);
        //        return processData.AsApiResponse();
        //    }
        //    catch (Exception ex)
        //    {
        //        Logger.LogError(ex, ex.Message);
        //        return ApiUtils.CreateErrorResponse<ProcessData>(ex);
        //    }
        //}

        [HttpPost, Route("draft/workingstatus")]
        [Authorize]
        public async ValueTask<ApiResponse<Dictionary<Guid, ProcessStatus>>> GetDraftProcessWorkingStatusAsync(List<Guid> opmProcessIds, Guid teamAppId, bool isGetAll)
        {
            try
            {
                IAuthorizedProcessQuery authorizedProcessQuery;

                if (opmProcessIds.Count == 0 && isGetAll)
                {
                    authorizedProcessQuery = await ProcessSecurityService.InitAuthorizedProcessByVersionQueryAsync(DraftOrPublishedVersionType.Draft,
                  limitedTeamAppIds: new List<Guid> { teamAppId });
                }
                else
                {
                    authorizedProcessQuery = await ProcessSecurityService.InitAuthorizedProcessByVersionQueryAsync(DraftOrPublishedVersionType.Draft,
                    limitedTeamAppIds: new List<Guid> { teamAppId },
                    limitedOPMProcessIds: opmProcessIds);
                }

                var processWorkingStatus = await ProcessService.GetProcessWorkingStatusAsync(authorizedProcessQuery);
                return processWorkingStatus.AsApiResponse();
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message);
                return ApiUtils.CreateErrorResponse<Dictionary<Guid, ProcessStatus>>(ex);
            }
        }

        [HttpPost, Route("published/workingstatus")]
        [Authorize]
        public async ValueTask<ApiResponse<Dictionary<Guid, ProcessStatus>>> GetPublishedProcessWorkingStatusAsync(List<Guid> opmProcessIds, Guid teamAppId)
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
                return ApiUtils.CreateErrorResponse<Dictionary<Guid, ProcessStatus>>(ex);
            }
        }

        [HttpGet, Route("byprocessstep/{processStepId:guid}/{edition:int}/{revision:int}")]
        [Authorize]
        public async ValueTask<ApiResponse<Process>> GetArchivedOrPublishedProcessByProcessStepIdAsync(Guid processStepId, int edition, int revision)
        {
            try
            {
                var securityResponse = await ProcessSecurityService.InitSecurityResponseByPublishedProcessStepIdAsync(processStepId);

                return await securityResponse
                    .RequireAuthor()
                    .OrRequireReader()
                    .DoAsync(async (teamAppId, opmProcessId, processVersionType) =>
                    {
                        var process = await ProcessService.GetProcessByVersionAsync(opmProcessId, edition, revision);

                        //If the request is not getting latest published version, then we can cache it forever.
                        //Because the request url for latest published version could be response different data
                        if (!ProcessVersionHelper.IsLatestPublishedVersion(edition, revision))
                        {
                            Response.GetTypedHeaders().CacheControl = new Microsoft.Net.Http.Headers.CacheControlHeaderValue()
                            {
                                Public = true,
                                MaxAge = TimeSpan.FromDays(365)
                            };
                        }

                        return process.AsApiResponse();
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
        public async ValueTask<ApiResponse<PreviewProcessWithCheckoutInfo>> GetPreviewProcessByProcessStepIdAsync(Guid processStepId)
        {
            try
            {
                var authorizedProcessQuery = await ProcessSecurityService.InitAuthorizedProcessByProcessStepIdQueryAsync(processStepId);
                var processes = await ProcessService.GetAuthorizedProcessesAsync(authorizedProcessQuery);

                var checkedOutProcess = processes.FirstOrDefault(p => p.VersionType == ProcessVersionType.CheckedOut);
                var draftProcess = processes.FirstOrDefault(p => p.VersionType == ProcessVersionType.Draft);
                var publishedProcess = processes.FirstOrDefault(p => p.VersionType == ProcessVersionType.Published);

                ProcessCheckoutInfo checkoutInfo = null;

                checkoutInfo = GenerateProcessCheckoutInfo(authorizedProcessQuery, draftProcess);

                Process process = null;
                if (checkedOutProcess != null)
                {
                    process = checkedOutProcess;
                }
                else if (draftProcess != null)
                {
                    process = draftProcess;
                }
                else if (publishedProcess != null)
                {
                    process = publishedProcess;
                }
                else
                {
                    throw new Exception($"Unauthorized or process step id: {processStepId} not found");
                }

                var result = new PreviewProcessWithCheckoutInfo
                {
                    Process = process,
                    CheckoutInfo = checkoutInfo
                };

                return result.AsApiResponse();
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message);
                return ApiUtils.CreateErrorResponse<PreviewProcessWithCheckoutInfo>(ex);
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
                    .OrRequireReviewer()
                    .OrRequireApprover()
                    .OrRequireReader(ProcessVersionType.Archived, ProcessVersionType.Published)
                    .DoAsync(async () =>
                    {
                        var process = await ProcessService.GetProcessByIdAsync(processId);

                        //For published/archived version, we can cache the value like forever
                        if (process.VersionType == ProcessVersionType.Archived || process.VersionType == ProcessVersionType.Published)
                        {
                            Response.GetTypedHeaders().CacheControl = new Microsoft.Net.Http.Headers.CacheControlHeaderValue()
                            {
                                Public = true,
                                MaxAge = TimeSpan.FromDays(365)
                            };
                        }
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
                   .RequireAuthor(ProcessVersionType.CheckedOut)
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
                var securityResponse = await ProcessSecurityService.InitSecurityResponseByOPMProcessIdAsync(opmProcessId, ProcessVersionType.Published);

                return await securityResponse
                    .RequireAuthor()
                    .DoAsync(async () =>
                    {
                        var result = await ProcessService.CheckIfDraftExist(opmProcessId);
                        return ApiUtils.CreateSuccessResponse(result);
                    });
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message);
                return ApiUtils.CreateErrorResponse<bool>(ex);
            }
        }

        [HttpGet, Route("processsite/{teamAppId:guid}")]
        [Authorize]
        public async ValueTask<ApiResponse<ProcessSite>> GetProcessSiteAsync(Guid teamAppId)
        {
            try
            {
                var webUrl = await TeamCollaborationAppService.GetSharePointSiteUrlAsync(teamAppId);
                PortableClientContext ctx = SharePointClientContextProvider.CreateClientContext(webUrl);
                ctx.Load(ctx.Web, w => w.Title);
                await ctx.ExecuteQueryAsync();
                var siteInfo = new ProcessSite
                {
                    Id = teamAppId,
                    Name = ctx.Web.Title,
                    Url = webUrl + "/" + OPMConstants.OPMPages.SitePages + "/" + OPMConstants.OPMPages.ProcessLibraryPageName
                };

                return siteInfo.AsApiResponse();
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message);
                return ApiUtils.CreateErrorResponse<ProcessSite>(ex);
            }
        }

        [HttpGet, Route("history/{opmProcessId:guid}")]
        [Authorize]
        public async ValueTask<ApiResponse<List<Process>>> GetProcessHistory(Guid opmProcessId)
        {
            try
            {
                var securityResponse = await ProcessSecurityService.InitSecurityResponseByOPMProcessIdAsync(opmProcessId, ProcessVersionType.Published);

                return await securityResponse
                   .RequireAuthor()
                   .OrRequireApprover()
                   .OrRequireReviewer()
                   .OrRequireReader()
                   .DoAsync(async () =>
                   {
                       var processes = await ProcessService.GetProcessesByOPMProcessIdAsync(opmProcessId, ProcessVersionType.Published, ProcessVersionType.Archived);
                       return ApiUtils.CreateSuccessResponse(processes);
                   });
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message);
                return ApiUtils.CreateErrorResponse<List<Process>>(ex);
            }
        }

        [HttpGet, Route("published/{opmProcessId:guid}")]
        [Authorize]
        public async ValueTask<ApiResponse<Process>> GetPublishedProcessAsync(Guid opmProcessId)
        {
            try
            {
                var securityResponse = await ProcessSecurityService.InitSecurityResponseByOPMProcessIdAsync(opmProcessId, ProcessVersionType.Published);

                return await securityResponse
                   .RequireAuthor()
                   .OrRequireApprover()
                   .OrRequireReviewer()
                   .OrRequireReader()
                   .DoAsync(async () =>
                   {
                       var process = (await ProcessService.GetProcessesByOPMProcessIdAsync(opmProcessId, ProcessVersionType.Published)).FirstOrDefault();
                       return ApiUtils.CreateSuccessResponse(process);
                   });
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message);
                return ApiUtils.CreateErrorResponse<Process>(ex);
            }
        }

        private ProcessCheckoutInfo GenerateProcessCheckoutInfo(IAuthorizedProcessQuery authorizedProcessQuery, Process draftProcess)
        {
            if (draftProcess == null)
            {
                return null;
            }

            var checkedOutBy = draftProcess.CheckedOutBy;
            var teamAppId = draftProcess.TeamAppId;
            var workingStatus = draftProcess.ProcessWorkingStatus;

            var canCheckout = (string.IsNullOrEmpty(checkedOutBy) || checkedOutBy.ToLower() == OmniaContext.Identity.LoginName.ToLower()) &&
                    (authorizedProcessQuery.IsAuthor(teamAppId) || authorizedProcessQuery.IsReviewer(teamAppId));

            var noActiveWorkflow = !OPMUtilities.IsActiveWorkflow(workingStatus);

            var checkoutInfo = new ProcessCheckoutInfo
            {
                CheckedOutBy = checkedOutBy,
                CanCheckout = canCheckout && noActiveWorkflow,
                CanTakeControl = authorizedProcessQuery.IsAuthor(teamAppId) && !canCheckout && noActiveWorkflow
            };

            return checkoutInfo;
        }
    }
}