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
using Omnia.ProcessManagement.Core.Services.Security;
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
        IProcessService ProcessService { get; }

        public TaskController(ILogger<ProcessController> logger,
            IWorkflowTaskService workflowTaskService,
            IProcessService processService)
        {
            WorkflowTaskService = workflowTaskService;
            Logger = logger;
            ProcessService = processService;
        }


        [HttpGet, Route("approval/{teamAppId:guid}/{spItemId:int}")]
        [Authorize]
        public async ValueTask<ApiResponse<WorkflowTask>> GetWorkflowApprovalTaskAsync(int spItemId, Guid teamAppId)
        {
            try
            {
                //We based on the permission on SharePoint for this task item
                var workflowTask = await WorkflowTaskService.GetAsync(spItemId, teamAppId, true);
                if (!workflowTask.IsCompleted)
                {
                    var process = (await ProcessService.GetProcessesByOPMProcessIdAsync(workflowTask.Workflow.OPMProcessId, ProcessVersionType.Draft)).FirstOrDefault();
                    if (process != null)
                        workflowTask.RootProcessStepId = process.RootProcessStep.Id;
                }
                return workflowTask.AsApiResponse();
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message);
                return ApiUtils.CreateErrorResponse<WorkflowTask>(ex);
            }
        }
    }
}