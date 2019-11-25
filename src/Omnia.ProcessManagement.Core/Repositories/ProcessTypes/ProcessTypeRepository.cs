using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Omnia.Fx.Models.Language;
using Omnia.ProcessManagement.Models.ProcessTypes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Repositories.ProcessTypes
{
    internal class ProcessTypeRepository : RepositoryBase<Entities.ProcessTypes.ProcessType>, IProcessTypeRepository
    {
        public ProcessTypeRepository(OmniaPMDbContext databaseContext) : base(databaseContext) { }

        public async ValueTask<IList<ProcessType>> GetAllProcessTypes(Guid termSetId)
        {
            var entities = await _dbSet.Where(i => i.DeletedAt == null && i.RootId == termSetId).ToListAsync();
            var models = ParseEntitiesToModels(entities);
            return models;
        }

        public async ValueTask<IList<ProcessType>> GetByIdAsync(List<Guid> ids)
        {
            var entities = await _dbSet.Where(i => i.DeletedAt == null && ids.Contains(i.Id)).ToListAsync();
            var model = ParseEntitiesToModels(entities);
            return model;
        }

        public async ValueTask SyncFromSharePointAsync(List<ProcessType> processTypes)
        {
            if (processTypes.Count > 0)
            {
                var rootId = processTypes.First().Settings.TermSetId;
                var rootProcessTypeExist = await _dbSet.Where(d => d.Id == rootId && d.DeletedAt == null).AnyAsync();
                var processTypesExist = await _dbSet.Where(d => d.RootId == rootId && d.DeletedAt == null).AnyAsync();

                if (!rootProcessTypeExist)
                    throw new Exception($"Root document type for termset {rootId} is not created.");

                if (processTypesExist)
                    throw new Exception($"There are existing document types mapping to termset {rootId} in database.");

                using (var transaction = _dataContext.Database.BeginTransaction())
                {
                    _dbSet.RemoveRange(_dbSet.AsTracking().Where(x => x.RootId == rootId && x.DeletedAt != null));

                    foreach (var processType in processTypes)
                    {
                        var entity = ParseModelToEntity(processType);
                        _dbSet.Add(entity);
                    }
                    await _dataContext.SaveChangesAsync();
                    transaction.Commit();
                }
            }
        }

        public async ValueTask<ProcessType> CreateAsync(ProcessType processType)
        {
            var entity = ParseModelToEntity(processType);
            _dbSet.Add(entity);
            await _dataContext.SaveChangesAsync();

            var model = ParseEntityToModel(entity);
            return model;
        }

        public async ValueTask<ProcessType> UpdateAsync(ProcessType processType)
        {
            var dbEntity = await _dbSet.AsTracking().FirstOrDefaultAsync(item => item.Id == processType.Id && item.DeletedAt == null);

            if (dbEntity == null)
            {
                throw new Exception("Document type not found");
            }
            else if (dbEntity.DeletedAt != null)
            {
                throw new Exception("Unable to update deleted document type");
            }

            var dbModel = ParseEntityToModel(dbEntity);
            if (dbModel.Settings.TermSetId != processType.Settings.TermSetId)
            {
                throw new Exception("Unable to update term set id");
            }

            var entity = ParseModelToEntity(processType);
            dbEntity.Title = entity.Title;
            dbEntity.JsonValue = entity.JsonValue;

            await _dataContext.SaveChangesAsync();
            return processType;
        }

        public async ValueTask<ProcessType> RemoveAsync(Guid id)
        {
            var dbEntity = await _dbSet.AsTracking().FirstOrDefaultAsync(item => item.Id == id && item.DeletedAt == null);
            if (dbEntity == null)
            {
                throw new Exception("Process type not found");
            }

            dbEntity.DeletedAt = DateTimeOffset.UtcNow;
            await _dataContext.SaveChangesAsync();

            var model = ParseEntityToModel(dbEntity);
            return model;
        }

        private IList<ProcessType> ParseEntitiesToModels(IList<Entities.ProcessTypes.ProcessType> entities)
        {
            var result = entities.Select(this.ParseEntityToModel).ToList();
            return result;
        }

        private ProcessType ParseEntityToModel(Entities.ProcessTypes.ProcessType entity)
        {
            ProcessType model = null;
            if (entity != null)
            {
                model = new ProcessType();
                model.Id = entity.Id;
                model.SecondaryOrderNumber = entity.ClusteredId;
                model.Settings = string.IsNullOrWhiteSpace(entity.JsonValue) ? null : (ProcessTypeSettings)JsonConvert.DeserializeObject<ProcessTypeItemSettings>(entity.JsonValue);
                model.Title = string.IsNullOrWhiteSpace(entity.Title) ? new MultilingualString() : JsonConvert.DeserializeObject<MultilingualString>(entity.Title);
            }

            return model;
        }

        private Entities.ProcessTypes.ProcessType ParseModelToEntity(ProcessType model)
        {
            var entity = new Entities.ProcessTypes.ProcessType();
            entity.Id = model.Id;
            entity.Title = model.Title != null ? JsonConvert.SerializeObject(model.Title) : "";
            entity.JsonValue = JsonConvert.SerializeObject(model.Settings);
            entity.RootId = model.Settings.TermSetId;

            return entity;
        }
    }
}
