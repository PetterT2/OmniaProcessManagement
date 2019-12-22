using Omnia.Fx.Models.Language;
using Omnia.ProcessManagement.Models.Processes;
using Omnia.ProcessManagement.Models.ProcessLibrary;
using Omnia.ProcessManagement.Models.Workflows;
using System;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Services.ProcessLibrary
{
    public interface IPublishProcessService
    {
        ValueTask PublishProcessAsync(Guid teamAppId, PublishProcessWithoutApprovalRequest request);
        ValueTask PublishProcessWithApprovalAsync(PublishProcessWithApprovalRequest request);
        ValueTask CompleteWorkflowAsync(WorkflowApprovalTask approvalTask);


        ValueTask ProcessSendingForApprovalAsync(Process process);
        ValueTask UpdateSendingForApprovalFailedAsync(Process process);

        ValueTask ProcessCancellingApprovalAsync(Process process);
        ValueTask UpdateCancellingApprovalFailedAsync(Process process);
    }
}
