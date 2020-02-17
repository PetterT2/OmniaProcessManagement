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
using Omnia.Fx.Utilities;
using Omnia.ProcessManagement.Core;
using Omnia.ProcessManagement.Core.Services.Processes;
using Omnia.ProcessManagement.Core.Services.ProcessLibrary;
using Omnia.ProcessManagement.Core.Services.ReviewReminders;
using Omnia.ProcessManagement.Core.Services.Security;
using Omnia.ProcessManagement.Core.Services.SharePoint;
using Omnia.ProcessManagement.Core.Services.TeamCollaborationApps;
using Omnia.ProcessManagement.Core.Services.Workflows;
using Omnia.ProcessManagement.Models.Enums;
using Omnia.ProcessManagement.Models.Exceptions;
using Omnia.ProcessManagement.Models.Processes;
using Omnia.ProcessManagement.Models.ProcessLibrary;
using Omnia.ProcessManagement.Models.ReviewReminders;
using Omnia.ProcessManagement.Models.Workflows;

namespace Omnia.ProcessManagement.Web.Controllers
{
    [Route("api/reviewreminder")]
    [ApiController]
    public class ReviewReminderController : ControllerBase
    {
        ISharePointTaskService SharePointTaskService { get; }
        IProcessSecurityService ProcessSecurityService { get; }
        IProcessService ProcessService { get; }
        ILogger<ReviewReminderController> Logger { get; }
        ITeamCollaborationAppsService TeamCollaborationAppsService { get; }
        IReviewReminderService ReviewReminderService { get; }
        IUnpublishProcessService UnpublishProcessService { get; }
        public ReviewReminderController(ISharePointTaskService sharePointTaskService,
            IProcessSecurityService processSecurityService,
            IProcessService processService,
            ITeamCollaborationAppsService teamCollaborationAppsService,
            IReviewReminderService reviewReminderService,
            IUnpublishProcessService unpublishProcessService,
            ILogger<ReviewReminderController> logger)
        {
            ProcessSecurityService = processSecurityService;
            SharePointTaskService = sharePointTaskService;
            ProcessService = processService;
            TeamCollaborationAppsService = teamCollaborationAppsService;
            ReviewReminderService = reviewReminderService;
            UnpublishProcessService = unpublishProcessService;
            Logger = logger;
        }

        [HttpGet, Route("{teamAppId:guid}/{spItemId:int}")]
        [Authorize]
        public async ValueTask<ApiResponse<ReviewReminderTask>> GetReviewReminderTaskAsync(Guid teamAppId, int spItemId)
        {
            try
            {
                var webUrl = await TeamCollaborationAppsService.GetSharePointSiteUrlAsync(teamAppId);
                var sharePointTask = await SharePointTaskService.GetTaskByIdAsync(webUrl, spItemId);

                var task = new ReviewReminderTask();
                task.SharePointTask = sharePointTask;

                var securityResponse = await ProcessSecurityService.InitSecurityResponseByOPMProcessIdAsync(sharePointTask.OPMProcessId, ProcessVersionType.Published);
                var authorizedRoles = await securityResponse.GetAuthorizedRolesAsync();

                task.HasAuthorPermission = authorizedRoles.Contains(new Guid(OPMConstants.Security.Roles.Author));
                var hasReaderPermission = authorizedRoles.Any();

                if (hasReaderPermission)
                {
                    var processes = await ProcessService.GetProcessesByOPMProcessIdAsync(sharePointTask.OPMProcessId, ProcessVersionType.Published, ProcessVersionType.Draft);
                    var publishedProcess = processes.FirstOrDefault(p => p.VersionType == ProcessVersionType.Published);
                    var draftProcess = processes.FirstOrDefault(p => p.VersionType == ProcessVersionType.Draft);


                    task.PublishedProcess = publishedProcess;
                    task.DraftExists = draftProcess != null;
                }

                return task.AsApiResponse();
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message);
                return ApiUtils.CreateErrorResponse<ReviewReminderTask>(ex);
            }
        }

        [HttpPost, Route("{teamAppId:guid}/{spItemId:int}/closetask")]
        [Authorize]
        public async ValueTask<ApiResponse> CloseReviewReminderTaskAsync(Guid teamAppId, int spItemId)
        {
            try
            {
                var webUrl = await TeamCollaborationAppsService.GetSharePointSiteUrlAsync(teamAppId);
                await ReviewReminderService.CompleteTaskAsync(webUrl, spItemId, ReviewReminderTaskOutcome.Undefined);

                return ApiUtils.CreateSuccessResponse();
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message);
                return ApiUtils.CreateErrorResponse(ex);
            }
        }

        [HttpPost, Route("{teamAppId:guid}/{spItemId:int}/setnewreviewdate")]
        [Authorize]
        public async ValueTask<ApiResponse> SetNewReviewDateAsync(Guid teamAppId, int spItemId, [FromBody] DateTime newReviewDate)
        {
            try
            {
                var webUrl = await TeamCollaborationAppsService.GetSharePointSiteUrlAsync(teamAppId);
                var sharePointTask = await SharePointTaskService.GetTaskByIdAsync(webUrl, spItemId);
                OPMUtilities.ValidateReviewReminderSharePointTask(sharePointTask);

                var securityResponse = await ProcessSecurityService.InitSecurityResponseByOPMProcessIdAsync(sharePointTask.OPMProcessId, ProcessVersionType.Published);
                return await securityResponse.RequireAuthor().DoAsync(async () =>
                {
                    var process = (await ProcessService.GetProcessesByOPMProcessIdAsync(sharePointTask.OPMProcessId, ProcessVersionType.Published)).FirstOrDefault();
                    await ReviewReminderService.EnsureReviewReminderAsync(process, newReviewDate);

                    await ReviewReminderService.CompleteTaskAsync(webUrl, spItemId, ReviewReminderTaskOutcome.SetNewReviewDate);

                    return ApiUtils.CreateSuccessResponse();
                });
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message);
                return ApiUtils.CreateErrorResponse(ex);
            }
        }

        [HttpPost, Route("{teamAppId:guid}/{spItemId:int}/createDraft")]
        [Authorize]
        public async ValueTask<ApiResponse> CreateDraftAsync(Guid teamAppId, int spItemId)
        {
            try
            {
                var webUrl = await TeamCollaborationAppsService.GetSharePointSiteUrlAsync(teamAppId);
                var sharePointTask = await SharePointTaskService.GetTaskByIdAsync(webUrl, spItemId);
                OPMUtilities.ValidateReviewReminderSharePointTask(sharePointTask);

                var securityResponse = await ProcessSecurityService.InitSecurityResponseByOPMProcessIdAsync(sharePointTask.OPMProcessId, ProcessVersionType.Published);
                return await securityResponse.RequireAuthor().DoAsync(async () =>
                {
                    var process = await ProcessService.CreateDraftProcessAsync(sharePointTask.OPMProcessId);
                    await ReviewReminderService.CompleteTaskAsync(webUrl, spItemId, ReviewReminderTaskOutcome.CreateDraft);

                    return ApiUtils.CreateSuccessResponse();
                });
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message);
                return ApiUtils.CreateErrorResponse(ex);
            }
        }

        [HttpPost, Route("{teamAppId:guid}/{spItemId:int}/unpublish")]
        [Authorize]
        public async ValueTask<ApiResponse> UnpublishProcessAsync(Guid teamAppId, int spItemId)
        {
            try
            {
                var webUrl = await TeamCollaborationAppsService.GetSharePointSiteUrlAsync(teamAppId);
                var sharePointTask = await SharePointTaskService.GetTaskByIdAsync(webUrl, spItemId);
                OPMUtilities.ValidateReviewReminderSharePointTask(sharePointTask);

                var securityResponse = await ProcessSecurityService.InitSecurityResponseByOPMProcessIdAsync(sharePointTask.OPMProcessId, ProcessVersionType.Published);
                return await securityResponse.RequireAuthor().DoAsync(async () =>
                {
                    await UnpublishProcessService.UnpublishProcessAsync(sharePointTask.OPMProcessId);
                    await ReviewReminderService.CompleteTaskAsync(webUrl, spItemId, ReviewReminderTaskOutcome.Unpublish);

                    return ApiUtils.CreateSuccessResponse();
                });
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message);
                return ApiUtils.CreateErrorResponse(ex);
            }
        }
    }
}