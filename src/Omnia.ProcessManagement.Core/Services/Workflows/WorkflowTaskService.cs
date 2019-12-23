using Omnia.ProcessManagement.Core.Repositories.Workflows;
using Omnia.ProcessManagement.Models.Enums;
using Omnia.ProcessManagement.Models.Workflows;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Services.Workflows
{
    internal class WorkflowTaskService : IWorkflowTaskService
    {
        IWorkflowTaskRepository WorkflowTaskRepository { get; }

        public WorkflowTaskService(IWorkflowTaskRepository workflowTaskRepository)
        {
            WorkflowTaskRepository = workflowTaskRepository;
        }

        public async ValueTask<WorkflowTask> CreateAsync(Guid workflowId, string assignedUser, int spItemId, Guid teamAPpId)
        {
            return await WorkflowTaskRepository.CreateAsync(workflowId, assignedUser, spItemId, teamAPpId);
        }

        public async ValueTask<WorkflowTask> GetAsync(int spItemId, Guid teamAppId)
        {
            return await WorkflowTaskRepository.GetAsync(spItemId, teamAppId);
        }

        public async ValueTask CompletedAsync(Guid id, string comment, TaskOutcome taskOutCome)
        {
            await WorkflowTaskRepository.SetCompletedTask(id, comment, taskOutCome);
        }
    }
}
