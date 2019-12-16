using Omnia.ProcessManagement.Models.Enums;
using Omnia.ProcessManagement.Models.ProcessActions;
using Omnia.ProcessManagement.Models.Processes;
using Omnia.ProcessManagement.Models.Workflows;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Services.Workflows
{
    public interface IWorkflowService
    {
        ValueTask<Workflow> CreateAsync(Workflow workflow);
        ValueTask<Workflow> GetAsync(Guid workflowId);
        ValueTask CompleteAsync(Guid id, WorkflowCompletedType completedType);
        ValueTask<Workflow> GetByProcessAsync(Guid opmProcessId, string webUrl);
    }
}
