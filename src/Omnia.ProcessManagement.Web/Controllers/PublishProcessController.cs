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
using Omnia.ProcessManagement.Core.Services.Processes;
using Omnia.ProcessManagement.Core.Services.ProcessLibrary;
using Omnia.ProcessManagement.Core.Services.Security;
using Omnia.ProcessManagement.Core.Services.Workflows;
using Omnia.ProcessManagement.Models.Enums;
using Omnia.ProcessManagement.Models.Processes;
using Omnia.ProcessManagement.Models.ProcessLibrary;
using Omnia.ProcessManagement.Models.Workflows;

namespace Omnia.ProcessManagement.Web.Controllers
{
    [Route("api/publish")]
    [ApiController]
    public class PublishProcessController : ControllerBase
    {
        ILogger<ProcessController> Logger { get; }
        IPublishProcessService PublishProcessService { get; }
        IProcessService ProcessService { get; }
        IWorkflowService WorkflowService { get; }
        IWorkflowTaskService WorkflowTaskService { get; }
        IProcessSecurityService ProcessSecurityService { get; }

        IOmniaContext OmniaContext { get; }

        public PublishProcessController(ILogger<ProcessController> logger,
            IPublishProcessService publishProcessService,
            IWorkflowService workflowService,
            IWorkflowTaskService workflowTaskService,
            IProcessService processService,
            IProcessSecurityService processSecurityService,
            IOmniaContext omniaContext)
        {
            PublishProcessService = publishProcessService;
            ProcessService = processService;
            WorkflowService = workflowService;
            WorkflowTaskService = workflowTaskService;
            ProcessSecurityService = processSecurityService;
            OmniaContext = omniaContext;
            Logger = logger;
        }


        [HttpPost, Route("withoutapproval")]
        [Authorize]
        public async ValueTask<ApiResponse> PublishProcessWithoutApprovalAsync(PublishProcessWithoutApprovalRequest request)
        {
            try
            {
                var securityResponse = await ProcessSecurityService.InitSecurityResponseByOPMProcessIdAsync(request.OPMProcessId, ProcessVersionType.Draft);

                return await securityResponse
                    .RequireAuthor()
                    .DoAsync(async (teamAppId, _) =>
                    {
                        await PublishProcessService.PublishProcessAsync(teamAppId, request);
                        return ApiUtils.CreateSuccessResponse();
                    });

            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message);
                return ApiUtils.CreateErrorResponse(ex);
            }
        }

        [HttpPost, Route("withapproval")]
        [Authorize]
        public async ValueTask<ApiResponse> PublishProcessWithApprovalAsync(PublishProcessWithApprovalRequest request)
        {
            try
            {
                var securityResponse = await ProcessSecurityService.InitSecurityResponseByOPMProcessIdAsync(request.OPMProcessId, ProcessVersionType.Draft);

                return await securityResponse
                    .RequireAuthor()
                    .DoAsync(async () =>
                    {
                        await PublishProcessService.PublishProcessWithApprovalAsync(request);
                        return ApiUtils.CreateSuccessResponse();
                    });

            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message);
                return ApiUtils.CreateErrorResponse<Process>(ex);
            }
        }


        [HttpGet, Route("workflow/{opmProcessId:guid}")]
        [Authorize]
        public async ValueTask<ApiResponse<Workflow>> GetWorkflowAsync(Guid opmProcessId)
        {
            try
            {
                var workflow = await WorkflowService.GetByProcessAsync(opmProcessId, WorkflowType.Approval);
                return workflow.AsApiResponse();
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message);
                return ApiUtils.CreateErrorResponse<Workflow>(ex);
            }
        }

        [HttpPost, Route("cancelworkflow/{opmProcessId:guid}")]
        [Authorize]
        public async ValueTask<ApiResponse> CancelWorkflowAsync(Guid opmProcessId)
        {
            try
            {
                var securityResponse = await ProcessSecurityService.InitSecurityResponseByOPMProcessIdAsync(opmProcessId, ProcessVersionType.Draft);

                return await securityResponse
                    .RequireAuthor()
                    .DoAsync(async () =>
                    {
                        await ProcessService.UpdateDraftProcessWorkingStatusAsync(opmProcessId, ProcessWorkingStatus.CancellingApproval, false);
                        return ApiUtils.CreateSuccessResponse();
                    });

            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message);
                return ApiUtils.CreateErrorResponse(ex);
            }
        }

        [HttpPost, Route("completeworkflow")]
        [Authorize]
        public async ValueTask<ApiResponse> CompleteWorkflowAsync(WorkflowTask approvalTask)
        {
            try
            {
                var securityResponse = await ProcessSecurityService.InitSecurityResponseByOPMProcessIdAsync(approvalTask.Workflow.OPMProcessId, ProcessVersionType.Draft);

                return await securityResponse
                    .RequireApprover()
                    .DoAsync(async (teamAppId, _) =>
                    {
                        //var dbWorkflow = await WorkflowService.GetAsync(approvalTask.WorkflowId);
                        var dbWorkflowTask = await WorkflowTaskService.GetAsync(approvalTask.SPTaskId, teamAppId, false);
                        if (dbWorkflowTask == null)
                        {
                            throw new Exception($"OPM task not found");
                        }
                        if (dbWorkflowTask.Workflow.WorkflowData.Type != WorkflowType.Approval)
                        {
                            throw new Exception($"This task is not approval task");
                        }
                        if (dbWorkflowTask.IsCompleted)
                        {
                            throw new Exception($"This task has been completed");
                        }

                        if (dbWorkflowTask.Workflow.CompletedType != WorkflowCompletedType.None)
                        {
                            throw new Exception($"This task was closed with status: {dbWorkflowTask.Workflow.CompletedType.ToString()}");
                        }

                        if (dbWorkflowTask.Workflow.OPMProcessId != approvalTask.Workflow.OPMProcessId)
                        {
                            throw new Exception($"This task is not belong to process with OPMProcessId: {dbWorkflowTask.Workflow.OPMProcessId}");
                        }

                        if (dbWorkflowTask.AssignedUser.ToLower() != OmniaContext.Identity.LoginName.ToLower())
                        {
                            throw new Exception("This task is not belong to current user");
                        }

                        var process = await ProcessService.GetProcessByOPMProcessIdAsync(dbWorkflowTask.Workflow.OPMProcessId, DraftOrPublishedVersionType.Draft);

                        await PublishProcessService.CompleteWorkflowAsync(approvalTask, process);

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