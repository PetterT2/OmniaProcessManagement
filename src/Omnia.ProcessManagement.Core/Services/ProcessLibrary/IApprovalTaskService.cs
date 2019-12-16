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
        ValueTask AddApprovalTaskAndSendEmailAsync(PublishProcessWithApprovalRequest request, Process process);
        ValueTask CancelApprovalTaskAndSendEmailAsync(Workflow workflow, Process process, string webUrl);
        ValueTask CompleteWorkflowAsync(WorkflowApprovalTask approvalTask);
        ValueTask CompletedApprovalTaskAndSendEmail(WorkflowApprovalTask approvalTask);
    }
}
