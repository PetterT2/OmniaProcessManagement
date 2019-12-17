using System;
using System.Threading.Tasks;
using Omnia.Fx.Localization;
using Omnia.Fx.Models.Extensions;
using Omnia.Fx.SharePoint.Client;
using Omnia.Fx.Users;
using Omnia.ProcessManagement.Core.Services.Processes;
using Omnia.ProcessManagement.Core.Services.Security;
using Omnia.ProcessManagement.Core.Services.SharePoint;
using Omnia.ProcessManagement.Core.Services.Workflows;
using Omnia.ProcessManagement.Models.Enums;
using Omnia.ProcessManagement.Models.Processes;
using Omnia.ProcessManagement.Models.ProcessLibrary;
using Omnia.ProcessManagement.Models.Workflows;

namespace Omnia.ProcessManagement.Core.Services.ProcessLibrary
{
    internal class PublishProcessService : IPublishProcessService
    {
        IProcessService ProcessService { get; }
        IApprovalTaskService ApprovalTaskService { get; }
        IWorkflowService WorkflowService { get; }
        IProcessSecurityService ProcessSecurityService { get; }

        public PublishProcessService(IProcessService processService,
            IApprovalTaskService approvalTaskService,
            IWorkflowService workflowService,
            IProcessSecurityService processSecurityService)
        {
            ProcessService = processService;
            ApprovalTaskService = approvalTaskService;
            WorkflowService = workflowService;
            ProcessSecurityService = processSecurityService;
        }

        public async ValueTask PublishProcessAsync(Guid teamAppId, PublishProcessWithoutApprovalRequest request)
        {
            try
            {
                var securityResourceId = await ProcessSecurityService.AddOrUpdateOPMReaderPermissionAsync(teamAppId, request.OPMProcessId, request.GetLimitedUsers());
                var process = await ProcessService.PublishProcessAsync(request.OPMProcessId, request.Comment, request.IsRevisionPublishing, securityResourceId);
            }
            catch (Exception ex)
            {
                await ProcessService.UpdateProcessStatusAsync(request.OPMProcessId, ProcessWorkingStatus.FailedPublishing, ProcessVersionType.Draft);
                throw;
            }
        }

        public async ValueTask<Process> PublishProcessWithApprovalAsync(PublishProcessWithApprovalRequest request)
        {
            try
            {
                var process = await ProcessService.BeforeApprovalProcessAsync(request.OPMProcessId, ProcessWorkingStatus.SendingForApproval);
                return process;
            }
            catch (Exception ex)
            {
                await ProcessService.UpdateProcessStatusAsync(request.OPMProcessId, ProcessWorkingStatus.FailedSendingForApproval, ProcessVersionType.Draft);
                throw;
            }
        }

        public async ValueTask ProcessingApprovalProcessAsync(PublishProcessWithApprovalRequest request)
        {
            try
            {
                var process = await ProcessService.GetProcessByIdAsync(request.ProcessId);
                await ProcessSecurityService.AddOrUpdateOPMApproverPermissionAsync(request.OPMProcessId, request.Approver.Uid);
                await ApprovalTaskService.AddApprovalTaskAndSendEmailAsync(request, process);
                await ProcessService.UpdateProcessStatusAsync(request.OPMProcessId, ProcessWorkingStatus.WaitingForApproval, Models.Enums.ProcessVersionType.Draft);
            }
            catch (Exception ex)
            {
                await ProcessSecurityService.RemoveOPMApproverPermissionAsync(request.OPMProcessId);
                await ProcessService.UpdateProcessStatusAsync(request.OPMProcessId, ProcessWorkingStatus.FailedSendingForApproval, Models.Enums.ProcessVersionType.Draft);
                throw;
            }
        }

        public async ValueTask ProcessingCancelWorkflowAsync(Guid opmProcessId, Guid workflowId, string webUrl)
        {
            try
            {
                var workflow = await WorkflowService.GetAsync(workflowId);
                var process = await ProcessService.GetProcessByIdAsync(workflow.ProcessId);
                if (process.OPMProcessId != opmProcessId)
                {
                    throw new Exception(""); //TO-DO : what message should we throw here ?!
                }

                await ProcessSecurityService.RemoveOPMApproverPermissionAsync(opmProcessId);
                await ApprovalTaskService.CancelApprovalTaskAndSendEmailAsync(workflow, process, webUrl);
                await ProcessService.UpdateProcessStatusAsync(opmProcessId, ProcessWorkingStatus.Draft, Models.Enums.ProcessVersionType.Draft);
            }
            catch(Exception ex)
            {
                await ProcessService.UpdateProcessStatusAsync(opmProcessId, ProcessWorkingStatus.FailedCancellingApproval, ProcessVersionType.Draft);
                throw;
            }
        }

        public async ValueTask CompleteWorkflowAsync(WorkflowApprovalTask approvalTask)
        {
            try
            {
                await ApprovalTaskService.CompleteWorkflowAsync(approvalTask);
                if (approvalTask.TaskOutcome == TaskOutcome.Approved)
                {
                    await ProcessService.UpdateProcessStatusAsync(approvalTask.Process.OPMProcessId, ProcessWorkingStatus.Publishing, Models.Enums.ProcessVersionType.Draft);
                }
            }
            catch (Exception ex)
            {
                await ProcessService.UpdateProcessStatusAsync(approvalTask.Process.OPMProcessId, ProcessWorkingStatus.FailedPublishing, ProcessVersionType.Draft);
                throw;
            }
        }

        public async ValueTask ProcessingCompleteWorkflowAsync(WorkflowApprovalTask approvalTask)
        {
            try
            {
                await ApprovalTaskService.CompletedApprovalTaskAndSendEmail(approvalTask);
                if (approvalTask.TaskOutcome == TaskOutcome.Approved)
                {
                    await ProcessService.UpdateProcessStatusAsync(approvalTask.Process.OPMProcessId, ProcessWorkingStatus.Published, Models.Enums.ProcessVersionType.Draft);
                    var approvalData = approvalTask.Workflow.WorkflowData.Cast<WorkflowData, WorkflowApprovalData>();
                    await ProcessService.PublishProcessAsync(approvalTask.Process.OPMProcessId, approvalTask.Workflow.WorkflowData.Comment, approvalData.IsRevisionPublishing);
                }
                else
                    await ProcessService.UpdateProcessStatusAsync(approvalTask.Process.OPMProcessId, ProcessWorkingStatus.Draft, Models.Enums.ProcessVersionType.Draft);
            }
            catch (Exception ex)
            {
                await ProcessService.UpdateProcessStatusAsync(approvalTask.Process.OPMProcessId, ProcessWorkingStatus.FailedPublishing, ProcessVersionType.Draft);
                await ProcessSecurityService.RemoveOPMApproverPermissionAsync(approvalTask.Process.OPMProcessId);
                throw;
            }
        }

    }
}
