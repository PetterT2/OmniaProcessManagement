using System;
using System.Threading.Tasks;
using Omnia.Fx.Localization;
using Omnia.Fx.Models.Extensions;
using Omnia.Fx.SharePoint.Client;
using Omnia.Fx.Users;
using Omnia.ProcessManagement.Core.Services.Processes;
using Omnia.ProcessManagement.Core.Services.SharePoint;
using Omnia.ProcessManagement.Core.Services.Workflows;
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

        public PublishProcessService(IProcessService processService,
            IApprovalTaskService approvalTaskService,
            IWorkflowService workflowService)
        {
            ProcessService = processService;
            ApprovalTaskService = approvalTaskService;
            WorkflowService = workflowService;
        }

        public async ValueTask PublishProcessAsync(PublishProcessWithoutApprovalRequest request)
        {
            var process = await ProcessService.PublishProcessAsync(request.OPMProcessId, request.Comment, request.IsRevisionPublishing);
        }

        public async ValueTask<Process> PublishProcessWithApprovalAsync(PublishProcessWithApprovalRequest request)
        {
            var process = await ProcessService.BeforeApprovalProcessAsync(request.OPMProcessId, ProcessWorkingStatus.SendingForApproval);
            return process;
        }

        public async ValueTask ProcessingApprovalProcessAsync(PublishProcessWithApprovalRequest request)
        {
            var process = await ProcessService.GetProcessByIdAsync(request.ProcessId);
            await ApprovalTaskService.AddApprovalTaskAndSendEmailAsync(request, process);
            await ProcessService.UpdateProcessStatusAsync(request.OPMProcessId, ProcessWorkingStatus.WaitingForApproval, Models.Enums.ProcessVersionType.Draft);
        }

        public async ValueTask ProcessingCancelWorkflowAsync(Guid opmProcessId, Guid workflowId, string webUrl)
        {
            var workflow = await WorkflowService.GetAsync(workflowId);
            var process = await ProcessService.GetProcessByIdAsync(workflow.ProcessId);
            await ApprovalTaskService.CancelApprovalTaskAndSendEmailAsync(workflow, process, webUrl);
            await ProcessService.UpdateProcessStatusAsync(opmProcessId, ProcessWorkingStatus.Draft, Models.Enums.ProcessVersionType.Draft);
        }

        public async ValueTask CompleteWorkflowAsync(WorkflowApprovalTask approvalTask)
        {
            await ApprovalTaskService.CompleteWorkflowAsync(approvalTask);
            if (approvalTask.TaskOutcome == TaskOutcome.Approved)
            {
                await ProcessService.UpdateProcessStatusAsync(approvalTask.Process.OPMProcessId, ProcessWorkingStatus.Publishing, Models.Enums.ProcessVersionType.Draft);
            }
        }

        public async ValueTask ProcessingCompleteWorkflowAsync(WorkflowApprovalTask approvalTask)
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

    }
}
