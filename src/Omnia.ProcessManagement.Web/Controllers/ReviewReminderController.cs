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

        public ReviewReminderController(ISharePointTaskService sharePointTaskService,
            IProcessSecurityService processSecurityService,
            IProcessService processService,
            ITeamCollaborationAppsService teamCollaborationAppsService,
            ILogger<ReviewReminderController> logger)
        {
            ProcessSecurityService = processSecurityService;
            SharePointTaskService = sharePointTaskService;
            ProcessService = processService;
            TeamCollaborationAppsService = teamCollaborationAppsService;
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
                var hasAuthorPermission= false;
                Process publishedProcess = null;
                Process draftProcess = null;
                if(sharePointTask.PercentComplete != 1)
                {
                    var securityResponse = ProcessSecurityService.InitSecurityResponseByTeamAppId(teamAppId);
                    hasAuthorPermission = await securityResponse.RequireAuthor().IsAuthorizedAsync();

                    if (hasAuthorPermission)
                    {
                        var processes = await ProcessService.GetProcessesByOPMProcessIdAsync(sharePointTask.OPMProcessId,ProcessVersionType.Published, ProcessVersionType.Draft);
                        publishedProcess = processes.FirstOrDefault(p => p.VersionType == ProcessVersionType.Published);
                        draftProcess = processes.FirstOrDefault(p => p.VersionType == ProcessVersionType.Draft);
                    }
                }

                var task = new ReviewReminderTask()
                {
                    SharePointTask = sharePointTask,
                    PublishedProcess = publishedProcess,
                    DraftExists = draftProcess != null,
                    HasAuthorPermission = hasAuthorPermission
                };

                return task.AsApiResponse();
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message);
                return ApiUtils.CreateErrorResponse<ReviewReminderTask>(ex);
            }
        }
    }
}