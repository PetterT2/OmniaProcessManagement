using Omnia.ProcessManagement.Models.Workflows;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Repositories.Workflows
{
   public interface  IWorkflowTaskRepository
    {
        ValueTask<WorkflowTask> CreateAsync(Guid workflowId, string assignedUser, int spItemId);
        ValueTask SetCompletedTask(Guid id, string comment, TaskOutcome taskOutCome);
        ValueTask<WorkflowTask> GetAsync(int spItemId, Guid teamAppInstanceId);
    }
}
