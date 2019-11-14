using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Omnia.Fx.Contexts;
using Omnia.Fx.Models.Extensions;
using Omnia.Fx.Utilities;
using Omnia.ProcessManagement.Models.Exceptions;
using Omnia.ProcessManagement.Models.ProcessActions;
using Omnia.ProcessManagement.Models.Processes;
using Omnia.ProcessManagement.Models.ProcessTemplates;

namespace Omnia.ProcessManagement.Core.Repositories.ProcessTemplates
{
    internal class ProcessTemplateRepository : RepositoryBase<Entities.ProcessTemplates.ProcessTemplate>, IProcessTemplateRepository
    {
        public ProcessTemplateRepository(OmniaPMDbContext databaseContext) : base(databaseContext)
        {
        }

        public async ValueTask<List<ProcessTemplate>> GetAllAsync()
        {
            var entities = await _dbSet.Where(d => d.DeletedAt == null).ToListAsync();
            var models = ParseEntitiesToModels(entities);
            return models;
        }

        public async ValueTask<ProcessTemplate> AddOrUpdateAsync(ProcessTemplate processTemplate)
        {
            var entity = ParseModelToEntity(processTemplate);
            var existingProcessTemplate = processTemplate.Id != Guid.Empty ? await _dbSet.AsTracking().FirstOrDefaultAsync(d => d.Id == processTemplate.Id && d.DeletedAt == null) : null;
            if (existingProcessTemplate == null)
            {
                existingProcessTemplate = new Entities.ProcessTemplates.ProcessTemplate
                {
                    Id = processTemplate.Id != Guid.Empty ? processTemplate.Id : Guid.NewGuid(),
                    JsonValue = entity.JsonValue
                };
                _dbSet.Add(existingProcessTemplate);
            }
            else
            {
                existingProcessTemplate.JsonValue = entity.JsonValue;
            }

            await _dataContext.SaveChangesAsync();

            return ParseEntityToModel(existingProcessTemplate);
        }


        public async ValueTask DeleteAsync(Guid id)
        {
            var exstingEntity = await _dbSet.AsTracking().FirstOrDefaultAsync(d => d.DeletedAt == null && d.Id == id);
            if (exstingEntity != null)
            {
                exstingEntity.DeletedAt = DateTimeOffset.UtcNow;
                await _dataContext.SaveChangesAsync();
            }
        }

        private List<ProcessTemplate> ParseEntitiesToModels(IList<Entities.ProcessTemplates.ProcessTemplate> entities)
        {
            var result = entities.Select(this.ParseEntityToModel).ToList();
            return result;
        }

        private ProcessTemplate ParseEntityToModel(Entities.ProcessTemplates.ProcessTemplate entity)
        {
            ProcessTemplate model = null;
            if (entity != null)
            {
                model = new ProcessTemplate();
                model.Id = entity.Id;
                model.Settings = string.IsNullOrWhiteSpace(entity.JsonValue) ? new ProcessTemplateSettings() : JsonConvert.DeserializeObject<ProcessTemplateSettings>(entity.JsonValue);
            }

            return model;
        }

        private Entities.ProcessTemplates.ProcessTemplate ParseModelToEntity(ProcessTemplate model)
        {
            var entity = new Entities.ProcessTemplates.ProcessTemplate();
            entity.Id = model.Id;
            entity.JsonValue = model.Settings != null ? JsonConvert.SerializeObject(model.Settings) : "";

            return entity;
        }
    }
}
