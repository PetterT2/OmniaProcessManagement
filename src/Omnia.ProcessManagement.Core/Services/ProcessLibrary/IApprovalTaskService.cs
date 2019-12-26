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
        ValueTask<int> AddSharePointTaskAndSendEmailAsync(Workflow workflow, WorkflowApprovalData workflowApprovalData, Process process, string webUrl);
        ValueTask CancelSharePointTaskAndSendEmailAsync(Workflow workflow, Process process, string webUrl);

        //The reason we split the CompleteSharePointTask and SendCompletedEmail 
        //Because we don't want the transaction rollback depends on the send email, which is not so important in approving a process
        ValueTask CompleteSharePointTaskAsync(WorkflowTask approvalTask, Process process, string webUrl);
        ValueTask SendCompletedEmailAsync(WorkflowTask approvalTask, Process process, string webUrl);
    }
}
