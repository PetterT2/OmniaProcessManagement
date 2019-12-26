using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Omnia.Fx.Contexts;
using Omnia.ProcessManagement.Models.Enums;
using Omnia.ProcessManagement.Models.Workflows;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Repositories.Workflows
{
    internal class WorkflowRepository : IWorkflowRepository
    {
        OmniaPMDbContext DbContext { get; }
        IOmniaContext OmniaContext { get; }
        public WorkflowRepository(OmniaPMDbContext databaseContext, IOmniaContext omniaContext)
        {
            DbContext = databaseContext;
            OmniaContext = omniaContext;
        }

        public async ValueTask CompleteAsync(Guid id, WorkflowCompletedType completedType)
        {
            var existingEntity = await DbContext.Workflows.AsTracking()
                .FirstOrDefaultAsync(x => x.Id == id && x.CompletedType == WorkflowCompletedType.None);

            if (existingEntity != null)
            {
                existingEntity.CompletedType = completedType;
                await DbContext.SaveChangesAsync();
            }
        }

        public async ValueTask<Workflow> CreateAsync(Workflow workflow)
        {
            try
            {
                var entity = MapModelToEf(workflow);
                DbContext.Workflows.Add(entity);
                await DbContext.SaveChangesAsync();

                var model = MapEfToModel(entity);
                return model;
            }
            catch (DbUpdateException exception)
            {
                if (exception.InnerException is SqlException sqlException &&
                    sqlException.Number == 2601 &&
                    sqlException.Message.Contains("IX_Workflows_OPMProcessId"))
                {
                    throw new Exception("There is another active workflow existing for this process");
                }
                throw;
            }
        }

        public async ValueTask<Workflow> GetByProcessAsync(Guid opmProcessId, WorkflowType workflowType)
        {
            var existingEntity = await DbContext.Workflows.Where(x => x.OPMProcessId == opmProcessId && x.Type == workflowType)
                .OrderByDescending(p => p.ClusteredId).Include(w => w.WorkflowTasks).FirstOrDefaultAsync();
            var model = MapEfToModel(existingEntity, true);
            return model;
        }

        public async ValueTask<Workflow> GetAsync(Guid workflowId)
        {
            var entity = await DbContext.Workflows.Where(w => w.Id == workflowId).Include(w => w.WorkflowTasks).FirstOrDefaultAsync();
            return MapEfToModel(entity, true);
        }

        private Workflow MapEfToModel(Entities.Workflows.Workflow entity, bool loadWorkflowTask = false)
        {
            Workflow model = null;
            if (entity != null)
            {
                model = new Models.Workflows.Workflow();
                model.Id = entity.Id;
                model.OPMProcessId = entity.OPMProcessId;
                model.Edition = entity.Edition;
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
            entity.OPMProcessId = model.OPMProcessId;
            entity.Edition = model.Edition;
            entity.DueDate = model.DueDate;
            entity.CompletedType = model.CompletedType;
            entity.Type = model.WorkflowData.Type;
            entity.JsonValue = JsonConvert.SerializeObject(model.WorkflowData);
            entity.CreatedBy = entity.ModifiedBy = OmniaContext.Identity.LoginName;
            entity.CreatedAt = entity.ModifiedAt = DateTimeOffset.UtcNow;

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
                model.IsCompleted = entity.IsCompleted;
                model.Comment = entity.Comment;
                model.SPTaskId = entity.SPTaskId;
                model.TeamAppId = entity.TeamAppId;
                model.CreatedAt = entity.CreatedAt;
                model.CreatedBy = entity.CreatedBy;
            }

            return model;
        }
    }
}
