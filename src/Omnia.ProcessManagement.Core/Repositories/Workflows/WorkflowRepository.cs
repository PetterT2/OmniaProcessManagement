using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Omnia.ProcessManagement.Models.Workflows;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Repositories.Workflows
{
    internal class WorkflowRepository : RepositoryBase<Entities.Workflows.Workflow>, IWorkflowRepository
    {
        public WorkflowRepository(OmniaPMDbContext databaseContext) : base(databaseContext) { }

        public async ValueTask CompleteAsync(Guid id, WorkflowCompletedType completedType)
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

        public async ValueTask<Workflow> GetByProcessAsync(Guid opmProcessId)
        {
            var existingEntity = await _dbSet.Where(x => x.DeletedAt == null && x.Process.OPMProcessId == opmProcessId && x.Process.ProcessWorkingStatus == Models.Processes.ProcessWorkingStatus.WaitingForApproval)
                .OrderByDescending(p => p.ClusteredId).Include(w => w.WorkflowTasks).FirstOrDefaultAsync();
            var model = MapEfToModel(existingEntity, true);
            return model;
        }

        public async ValueTask<Workflow> GetAsync(Guid workflowId)
        {
            var entity = await _dbSet.Where(w => w.Id == workflowId).Include(w => w.WorkflowTasks).FirstOrDefaultAsync();
            return MapEfToModel(entity, true);
        }

        private Workflow MapEfToModel(Entities.Workflows.Workflow entity, bool loadWorkflowTask = false)
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
                if (loadWorkflowTask)
                {
                    model.WorkflowTasks = entity.WorkflowTasks.ToList().Select(task => ParseWorkflowTaskEfToModel(task)).ToList();
                }
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

        private WorkflowTask ParseWorkflowTaskEfToModel(Entities.Workflows.WorkflowTask entity)
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
