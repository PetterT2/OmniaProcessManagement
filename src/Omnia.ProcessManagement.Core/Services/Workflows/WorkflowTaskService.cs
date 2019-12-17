using Omnia.ProcessManagement.Core.Repositories.Workflows;
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

        public async ValueTask<WorkflowTask> CreateAsync(Guid workflowId, string assignedUser, int spItemId)
        {
            return await WorkflowTaskRepository.CreateAsync(workflowId, assignedUser, spItemId);
        }

        public async ValueTask<WorkflowTask> GetAsync(int spItemId, Guid teamAppInstanceId)
        {
            return await WorkflowTaskRepository.GetAsync(spItemId, teamAppInstanceId);
        }

        public async ValueTask CompletedTask(Guid id, string comment, TaskOutcome taskOutCome)
        {
            await WorkflowTaskRepository.SetCompletedTask(id, comment, taskOutCome);
        }
    }
}
