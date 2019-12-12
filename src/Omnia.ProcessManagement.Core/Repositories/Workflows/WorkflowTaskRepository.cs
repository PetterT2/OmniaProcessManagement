using Microsoft.EntityFrameworkCore;
using Omnia.ProcessManagement.Models.Workflows;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Repositories.Workflows
{
    internal class WorkflowTaskRepository : RepositoryBase<Entities.Workflows.WorkflowTask>, IWorkflowTaskRepository
    {
        public WorkflowTaskRepository(OmniaPMDbContext databaseContext) : base(databaseContext)
        {

        }

        public async ValueTask<WorkflowTask> CreateAsync(Guid workflowId, string assignedUser, int spItemId)
        {
            Entities.Workflows.WorkflowTask entity = new Entities.Workflows.WorkflowTask();
            entity.Id = Guid.NewGuid();
            entity.WorkflowId = workflowId;
            entity.AssignedUser = assignedUser;
            entity.IsCompleted = false;
            entity.SPTaskId = spItemId;
            await _dbSet.AddAsync(entity);
            await _dataContext.SaveChangesAsync();
            return ParseEfToModel(entity);
        }

        public async ValueTask SetCompletedTask(Guid workflowTaskId, string comment, TaskOutcome taskOutCome)
        {
            var existingEntity = await _dbSet.AsTracking()
                .FirstOrDefaultAsync(x => x.Id == workflowTaskId);
            existingEntity.IsCompleted = true;
            existingEntity.Comment = comment;
            existingEntity.TaskOutcome = taskOutCome;
            await _dataContext.SaveChangesAsync();
        }

        private WorkflowTask ParseEfToModel(Entities.Workflows.WorkflowTask entity)
        {
            WorkflowTask model = null;
            if (entity != null)
            {
                model = new WorkflowTask();
                model.Id = entity.Id;
                model.WorkflowId = entity.WorkflowId;
                model.AssignedUser = entity.AssignedUser;
                model.CreatedBy = entity.CreatedBy;
                model.ModifiedBy = entity.ModifiedBy;
                model.CreatedAt = entity.CreatedAt;
                model.ModifiedAt = entity.ModifiedAt;
                model.IsCompleted = entity.IsCompleted;
                model.Comment = entity.Comment;
                model.SPTaskId = entity.SPTaskId;
            }

            return model;
        }

    }
}
