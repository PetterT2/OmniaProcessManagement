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
using Omnia.ProcessManagement.Core.Services.Processes;
using Omnia.ProcessManagement.Core.Services.ProcessLibrary;
using Omnia.ProcessManagement.Core.Services.SharePoint;
using Omnia.ProcessManagement.Core.Services.TeamCollaborationApps;
using Omnia.ProcessManagement.Core.Services.Workflows;
using Omnia.ProcessManagement.Models.Enums;
using Omnia.ProcessManagement.Models.Processes;
using Omnia.ProcessManagement.Models.ProcessLibrary;
using Omnia.ProcessManagement.Models.Workflows;

namespace Omnia.ProcessManagement.Web.Controllers
{
    [Route("api/task")]
    [ApiController]
    public class TaskController : ControllerBase
    {
        ILogger<ProcessController> Logger { get; }
        IWorkflowTaskService WorkflowTaskService { get; }
        ISharePointSiteService SharePointSiteService { get; }
        IProcessService ProcessService { get; }
        IOmniaContext OmniaContext { get; }
        IUserService UserService { get; }

        ITeamCollaborationAppsService TeamCollaborationAppService { get; }

        public TaskController(ILogger<ProcessController> logger,
            IWorkflowTaskService workflowTaskService,
            IProcessService processService,
            ISharePointSiteService sharePointSiteService,
            IUserService userService,
            IOmniaContext omniaContext,
            ITeamCollaborationAppsService teamCollaborationAppService)
        {
            WorkflowTaskService = workflowTaskService;
            SharePointSiteService = sharePointSiteService;
            ProcessService = processService;
            OmniaContext = omniaContext;
            UserService = userService;
            TeamCollaborationAppService = teamCollaborationAppService;
            Logger = logger;
        }


        [HttpGet, Route("{spItemId:int}")]
        [Authorize]
        public async ValueTask<ApiResponse<WorkflowApprovalTask>> GetWorkflowTaskAsync(int spItemId, Guid appInstanceId)
        {
            try
            {
                var webUrl = await TeamCollaborationAppService.GetSharePointSiteUrlAsync(appInstanceId);
                var workflowTask = await WorkflowTaskService.GetAsync(spItemId, appInstanceId);
                var workflowApprovalTask = new WorkflowApprovalTask(workflowTask);
                workflowApprovalTask.Process = await ProcessService.GetProcessByIdAsync(workflowTask.Workflow.ProcessId);
                workflowApprovalTask.Responsible = workflowTask.AssignedUser.Equals(OmniaContext.Identity.LoginName);
                var users = await UserService.GetByPrincipalNamesAsync(new List<string> { workflowTask.AssignedUser, workflowTask.CreatedBy });
                workflowApprovalTask.AssignedTo = users.FirstOrDefault(us => us.UserPrincipalName == workflowApprovalTask.AssignedUser);
                workflowApprovalTask.Author = users.FirstOrDefault(us => us.UserPrincipalName == workflowApprovalTask.CreatedBy);
                return workflowApprovalTask.AsApiResponse();
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message);
                return ApiUtils.CreateErrorResponse<WorkflowApprovalTask>(ex);
            }
        }

    }
}