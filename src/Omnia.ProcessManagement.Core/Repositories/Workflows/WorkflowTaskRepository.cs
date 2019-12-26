using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Omnia.ProcessManagement.Models.Enums;
using Omnia.ProcessManagement.Models.Workflows;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Repositories.Workflows
{
    internal class WorkflowTaskRepository : IWorkflowTaskRepository
    {
        OmniaPMDbContext DbContext { get; }
        public WorkflowTaskRepository(OmniaPMDbContext databaseContext)
        {
            DbContext = databaseContext;
        }

        public async ValueTask<WorkflowTask> CreateAsync(Guid workflowId, string assignedUser, int spItemId, Guid teamAppId)
        {
            var workflow = await DbContext.Workflows.Where(w => w.Id == workflowId).FirstOrDefaultAsync();
            if (workflow == null)
            {
                throw new Exception($"Not found workflow with id: {workflowId}");
            }

            if (workflow.CompletedType != WorkflowCompletedType.None)
            {
                throw new Exception($"This workflow with id: {workflowId} was completed and cannot add more task");
            }


            Entities.Workflows.WorkflowTask entity = new Entities.Workflows.WorkflowTask();
            entity.Id = Guid.NewGuid();
            entity.WorkflowId = workflowId;
            entity.AssignedUser = assignedUser;
            entity.IsCompleted = false;
            entity.SPTaskId = spItemId;
            entity.TeamAppId = teamAppId;
            entity.CreatedBy = entity.ModifiedBy = workflow.CreatedBy;
            entity.CreatedAt = entity.ModifiedAt = workflow.CreatedAt;

            await DbContext.WorkflowTasks.AddAsync(entity);
            await DbContext.SaveChangesAsync();

            return MapEfToModel(entity);
        }

        public async ValueTask SetCompletedTask(Guid workflowTaskId, string comment, TaskOutcome taskOutCome)
        {
            var existingEntity = await DbContext.WorkflowTasks.AsTracking()
                .FirstOrDefaultAsync(x => x.Id == workflowTaskId);
            existingEntity.IsCompleted = true;
            existingEntity.Comment = comment;
            existingEntity.TaskOutcome = taskOutCome;
            await DbContext.SaveChangesAsync();
        }

        public async ValueTask<WorkflowTask> GetAsync(int spItemId, Guid teamAppId)
        {
            var entity = await DbContext.WorkflowTasks.Where(w => w.SPTaskId == spItemId && w.TeamAppId == teamAppId)
                .Include(w => w.Workflow).FirstOrDefaultAsync();
            return MapEfToModel(entity);
        }

        private WorkflowTask MapEfToModel(Entities.Workflows.WorkflowTask entity)
        {
            WorkflowTask model = null;
            if (entity != null)
            {
                model = new WorkflowTask();
                model.Id = entity.Id;
                model.WorkflowId = entity.WorkflowId;
                model.AssignedUser = entity.AssignedUser;
                model.IsCompleted = entity.IsCompleted;
                model.Comment = entity.Comment;
                model.SPTaskId = entity.SPTaskId;
                model.CreatedBy = entity.CreatedBy;
                model.CreatedAt = entity.CreatedAt;
                if (entity.Workflow != null)
                    model.Workflow = MapEfToModel(entity.Workflow);
            }

            return model;
        }

        private Workflow MapEfToModel(Entities.Workflows.Workflow entity)
        {
            Workflow model = null;
            if (entity != null)
            {
                model = new Workflow();
                model.Id = entity.Id;
                model.OPMProcessId = entity.OPMProcessId;
                model.WorkflowData = JsonConvert.DeserializeObject<WorkflowData>(entity.JsonValue);
                model.DueDate = entity.DueDate;
                model.CompletedType = entity.CompletedType;
                model.CreatedBy = entity.CreatedBy;
                model.ModifiedBy = entity.ModifiedBy;
                model.CreatedAt = entity.CreatedAt;
                model.ModifiedAt = entity.ModifiedAt;
            }

            return model;
        }

    }
}
