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
using Omnia.Fx.Models.Users;
using Omnia.Fx.Utilities;
using Omnia.ProcessManagement.Core.Services.Processes;
using Omnia.ProcessManagement.Core.Services.ProcessLibrary;
using Omnia.ProcessManagement.Core.Services.Security;
using Omnia.ProcessManagement.Core.Services.Workflows;
using Omnia.ProcessManagement.Models.Enums;
using Omnia.ProcessManagement.Models.ProcessActions;
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

        IProcessSecurityService ProcessSecurityService { get; }

        public PublishProcessController(ILogger<ProcessController> logger,
            IPublishProcessService publishProcessService,
            IWorkflowService workflowService,
            IProcessService processService,
            IProcessSecurityService processSecurityService)
        {
            PublishProcessService = publishProcessService;
            ProcessService = processService;
            WorkflowService = workflowService;
            ProcessSecurityService = processSecurityService;
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
                    .DoAsync(async (teamAppId) =>
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
        public async ValueTask<ApiResponse<Process>> PublishProcessWithApprovalAsync(PublishProcessWithApprovalRequest request)
        {
            try
            {
                var securityResponse = await ProcessSecurityService.InitSecurityResponseByOPMProcessIdAsync(request.OPMProcessId, ProcessVersionType.Draft);

                return await securityResponse
                    .RequireAuthor()
                    .DoAsync(async () =>
                    {
                        var process = await PublishProcessService.PublishProcessWithApprovalAsync(request);
                        return ApiUtils.CreateSuccessResponse(process);
                    });

            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message);
                return ApiUtils.CreateErrorResponse<Process>(ex);
            }
        }

        [HttpPost, Route("processingapproval")]
        [Authorize]
        public async ValueTask<ApiResponse> ProcessingApprovalProcessAsync(PublishProcessWithApprovalRequest request)
        {
            try
            {
                var securityResponse = await ProcessSecurityService.InitSecurityResponseByOPMProcessIdAsync(request.OPMProcessId, ProcessVersionType.Draft);

                return await securityResponse
                    .RequireAuthor()
                    .DoAsync(async () =>
                    {
                        await PublishProcessService.ProcessingApprovalProcessAsync(request);
                        return ApiUtils.CreateSuccessResponse();
                    });

            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message);
                return ApiUtils.CreateErrorResponse(ex);
            }
        }

        [HttpGet, Route("workflow/{opmProcessId:guid}")]
        [Authorize]
        public async ValueTask<ApiResponse<Workflow>> GetWorkflowAsync(Guid opmProcessId, string webUrl)
        {
            try
            {
                var workflow = await WorkflowService.GetByProcessAsync(opmProcessId, webUrl);
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
                        await ProcessService.UpdateProcessStatusAsync(opmProcessId, ProcessWorkingStatus.CancellingApproval, ProcessVersionType.Draft);
                        return ApiUtils.CreateSuccessResponse();
                    });

            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message);
                return ApiUtils.CreateErrorResponse(ex);
            }
        }

        [HttpGet, Route("processingcancelworkflow/{opmProcessId}/{workflowId:guid}")]
        [Authorize]
        public async ValueTask<ApiResponse> ProcessingCancelWorkflowAsync(Guid opmProcessId, Guid workflowId)
        {
            try
            {
                var securityResponse = await ProcessSecurityService.InitSecurityResponseByOPMProcessIdAsync(opmProcessId, ProcessVersionType.Draft);

                return await securityResponse
                    .RequireAuthor()
                    .DoAsync(async (teamAppId) =>
                    {
                        await PublishProcessService.ProcessingCancelWorkflowAsync(opmProcessId, workflowId, teamAppId);
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
        public async ValueTask<ApiResponse> CompleteWorkflowAsync(WorkflowApprovalTask approvalTask)
        {
            try
            {
                var securityResponse = await ProcessSecurityService.InitSecurityResponseByOPMProcessIdAsync(approvalTask.Process.OPMProcessId, ProcessVersionType.Draft);

                return await securityResponse
                    .RequireApprover()
                    .DoAsync(async (teamAppId) =>
                    {
                        if (approvalTask.Process.TeamAppId != teamAppId)
                        {
                            throw new Exception(""); //TODO
                        }

                        await PublishProcessService.CompleteWorkflowAsync(approvalTask);
                        return ApiUtils.CreateSuccessResponse();
                    });
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, ex.Message);
                return ApiUtils.CreateErrorResponse(ex);
            }
        }

        [HttpPost, Route("processingcompleteworkflow")]
        [Authorize]
        public async ValueTask<ApiResponse> ProcessingCompleteWorkflowAsync(WorkflowApprovalTask approvalTask)
        {
            try
            {
                var securityResponse = await ProcessSecurityService.InitSecurityResponseByOPMProcessIdAsync(approvalTask.Process.OPMProcessId, ProcessVersionType.Draft);

                return await securityResponse
                    .RequireApprover()
                    .DoAsync(async (teamAppId) =>
                    {
                        if (approvalTask.Process.TeamAppId != teamAppId)
                        {
                            throw new Exception(""); //TODO
                        }

                        await PublishProcessService.ProcessingCompleteWorkflowAsync(approvalTask);
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