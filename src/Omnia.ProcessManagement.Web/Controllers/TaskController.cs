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
        IProcessLibraryService ProcessLibraryService { get; }
        IProcessService ProcessService { get; }
        IOmniaContext OmniaContext { get; }
        IUserService UserService { get; }

        public TaskController(ILogger<ProcessController> logger,
            IWorkflowTaskService workflowTaskService,
            IProcessService processService,
            IProcessLibraryService processLibraryService,
            IUserService userService,
            IOmniaContext omniaContext)
        {
            WorkflowTaskService = workflowTaskService;
            ProcessLibraryService = processLibraryService;
            ProcessService = processService;
            OmniaContext = omniaContext;
            UserService = userService;
            Logger = logger;
        }


        [HttpGet, Route("{spItemId:int}")]
        [Authorize]
        public async ValueTask<ApiResponse<WorkflowApprovalTask>> GetWorkflowTaskAsync(int spItemId, string webUrl)
        {
            try
            {
                var site = await ProcessLibraryService.GetProcessSiteInfo(webUrl);
                var workflowTask = await WorkflowTaskService.GetAsync(spItemId, site.Item1, site.Item2);
                var workflowApprovalTask = new WorkflowApprovalTask(workflowTask);
                workflowApprovalTask.Process = await ProcessService.GetProcessByIdAsync(workflowTask.Workflow.ProcessId);
                workflowApprovalTask.Responsible = workflowTask.AssignedUser.Equals(OmniaContext.Identity.LoginName);
                var users = await UserService.GetByPrincipalNamesAsync(new List<string> { workflowTask.AssignedUser, workflowTask.CreatedBy });
                workflowApprovalTask.AssignedTo = users.FirstOrDefault(us => us.UserPrincipalName == workflowApprovalTask.AssignedUser);
                workflowApprovalTask.Author = users.FirstOrDefault(us => us.UserPrincipalName == workflowApprovalTask.CreatedBy);
                workflowApprovalTask.WebUrl = webUrl;
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