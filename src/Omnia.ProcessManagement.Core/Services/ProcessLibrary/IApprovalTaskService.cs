using Omnia.ProcessManagement.Models.Processes;
using Omnia.ProcessManagement.Models.ProcessLibrary;
using Omnia.ProcessManagement.Models.Workflows;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Services.ProcessLibrary
{
    public interface IApprovalTaskService
    {
        ValueTask AddWorkflowAsync(PublishProcessWithApprovalRequest request);
        ValueTask<int> AddSharePointApprovalTaskAndSendEmailAsync(Workflow workflow, WorkflowApprovalData workflowApprovalData, Process process, string webUrl);
        ValueTask CancelApprovalTaskAndSendEmailAsync(Workflow workflow, Process process, string webUrl);
        ValueTask CompleteSharePointTaskAsync(WorkflowApprovalTask approvalTask, string webUrl);
        ValueTask SendCompletedEmailAsync(WorkflowApprovalTask approvalTask);
    }
}
