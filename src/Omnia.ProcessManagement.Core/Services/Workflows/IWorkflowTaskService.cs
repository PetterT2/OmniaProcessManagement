using Omnia.ProcessManagement.Models.Workflows;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Services.Workflows
{
    public interface IWorkflowTaskService
    {
        ValueTask<WorkflowTask> CreateAsync(Guid workflowId, string assignedUser, int spItemId);
        ValueTask<WorkflowTask> GetAsync(int spItemId, Guid siteId, Guid webId);
    }
}
