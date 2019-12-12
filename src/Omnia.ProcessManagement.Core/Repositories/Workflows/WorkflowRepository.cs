using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Omnia.ProcessManagement.Models.Workflows;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Repositories.Workflows
{
    internal class WorkflowRepository : RepositoryBase<Entities.Workflows.Workflow>, IWorkflowRepository
    {
        public WorkflowRepository(OmniaPMDbContext databaseContext) : base(databaseContext) { }

        public async ValueTask CompleteAsync(Guid id, Models.Workflows.TaskStatus status, WorkflowCompletedType completedType)
        {
            var existingEntity = await _dbSet.AsTracking()
                .FirstOrDefaultAsync(x => x.Id == id);
            existingEntity.CompletedType = completedType;
            await _dataContext.SaveChangesAsync();
        }

        public async ValueTask<Workflow> CreateAsync(Workflow workflow)
        {
            var entity = MapModelToEf(workflow);
            await _dbSet.AddAsync(entity);
            await _dataContext.SaveChangesAsync();

            var model = MapEfToModel(entity);
            return model;
        }

        private Workflow MapEfToModel(Entities.Workflows.Workflow entity)
        {
            Workflow model = null;
            if (entity != null)
            {
                model = new Models.Workflows.Workflow();
                model.Id = entity.Id;
                model.ProcessId = entity.ProcessId;
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

        private Entities.Workflows.Workflow MapModelToEf(Workflow model)
        {
            var entity = new Entities.Workflows.Workflow();
            entity.Id = model.Id;
            entity.ProcessId = model.ProcessId;
            entity.DueDate = model.DueDate;
            entity.CompletedType = model.CompletedType;
            entity.Type = model.WorkflowData.Type;
            entity.JsonValue = JsonConvert.SerializeObject(model.WorkflowData);
            return entity;
        }
    }
}
