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

        public async ValueTask<IDictionary<Guid, int>> GetChildCountAsync(IList<Guid> ids)
        {
            var (sql, param) = GetChildCountQuery(ids);
            var result = await _dataContext.ProcessTypeChildCounts.FromSqlRaw(sql, param.ToArray()).ToDictionaryAsync(d => d.Id, d => d.ChildCount);
            return result;
        }

        public async ValueTask<IList<ProcessType>> GetChildrenAsync(Guid? parentId)
        {
            var entities = await _dbSet.Where(i => i.DeletedAt == null && i.ParentId == parentId).ToListAsync();
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
                var processTypesExist = await _dbSet.Where(d => d.ParentId.HasValue && d.RootId == rootId && d.DeletedAt == null).AnyAsync();

                if (!rootProcessTypeExist)
                    throw new Exception($"Root process type for termset {rootId} is not created.");

                if (processTypesExist)
                    throw new Exception($"There are existing process types mapping to termset {rootId} in database.");

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
            if (processType.ParentId.HasValue)
            {
                await ValidateParentAsync(processType.ParentId.Value, processType.Settings.TermSetId);
            }

            var entity = ParseModelToEntity(processType);
            _dbSet.Add(entity);
            await _dataContext.SaveChangesAsync();

            var model = ParseEntityToModel(entity);
            return model;
        }

        public async ValueTask<(ProcessType, ProcessType)> UpdateAsync(ProcessType processType)
        {
            if (processType.ParentId.HasValue)
            {
                await ValidateParentAsync(processType.ParentId.Value, processType.Settings.TermSetId);
            }

            var dbEntity = await _dbSet.AsTracking().FirstOrDefaultAsync(item => item.Id == processType.Id && item.DeletedAt == null);

            if (dbEntity == null)
            {
                throw new Exception("Process type not found");
            }
            else if (dbEntity.DeletedAt != null)
            {
                throw new Exception("Unable to update deleted process type");
            }
            else if (dbEntity.Type != processType.Settings.Type)
            {
                throw new Exception("Unable to update process type's type");
            }

            var dbModel = ParseEntityToModel(dbEntity);

            if (dbModel.Settings.TermSetId != processType.Settings.TermSetId)
            {
                throw new Exception("Unable to update term set id");
            }

            var entity = ParseModelToEntity(processType);
            dbEntity.Title = entity.Title;
            dbEntity.ParentId = entity.ParentId;
            dbEntity.JsonValue = entity.JsonValue;
            dbEntity.Type = entity.Type;

            await _dataContext.SaveChangesAsync();
            return (processType, dbModel);
        }

        public async ValueTask<ProcessType> RemoveAsync(Guid id)
        {
            var dbEntity = await _dbSet.AsTracking().FirstOrDefaultAsync(item => item.Id == id && item.DeletedAt == null);
            if (dbEntity == null)
            {
                throw new Exception("Process type not found");
            }

            var hasChildren = await _dbSet.AnyAsync(item => item.ParentId == dbEntity.Id && item.DeletedAt == null);
            if (hasChildren)
                throw new Exception("Cannot delete the process type that have children");

            dbEntity.DeletedAt = DateTimeOffset.UtcNow;
            await _dataContext.SaveChangesAsync();

            var model = ParseEntityToModel(dbEntity);
            return model;
        }

        private (string, List<SqlParameter>) GetChildCountQuery(IList<Guid> ids)
        {
            List<SqlParameter> sqlParameters = new List<SqlParameter>();
            List<string> paramNames = new List<string>();
            for (var i = 0; i < ids.Count; i++)
            {
                var name = $"@id{i}";
                sqlParameters.Add(new SqlParameter(name, ids[i]));
                paramNames.Add(name);
            }

            var paramNamesStr = string.Join(',', paramNames);

            var sql = $@"
                Select N.Id, 
                (SELECT Count(*) FROM ProcessTypes WHERE ParentId = N.Id AND DeletedAt IS NULL) AS ChildCount
                FROM ProcessTypes as N
                WHERE N.Id in ({paramNamesStr})
            ";

            return (sql, sqlParameters);
        }

        private async ValueTask ValidateParentAsync(Guid parentId, Guid termSetId)
        {
            var parentEntity = await _dbSet.FirstOrDefaultAsync(d => d.Id == parentId && d.Type == ProcessTypeSettingsTypes.Group && d.DeletedAt == null);
            if (parentEntity == null)
                throw new Exception("parent process type is not found or invalid");


            var parentModel = ParseEntityToModel(parentEntity);
            if (parentModel.Settings.TermSetId != termSetId)
                throw new Exception("the parent of this process type has different term set");
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
                model.ParentId = entity.ParentId;
                model.SecondaryOrderNumber = entity.ClusteredId;
                model.Settings = string.IsNullOrWhiteSpace(entity.JsonValue) ? null :
                    entity.Type == ProcessTypeSettingsTypes.Item ? (ProcessTypeSettings)JsonConvert.DeserializeObject<ProcessTypeItemSettings>(entity.JsonValue) :
                    entity.Type == ProcessTypeSettingsTypes.Group ? (ProcessTypeSettings)JsonConvert.DeserializeObject<ProcessTypeGroupSettings>(entity.JsonValue) : null;
                model.Title = string.IsNullOrWhiteSpace(entity.Title) ? new MultilingualString() : JsonConvert.DeserializeObject<MultilingualString>(entity.Title);
            }

            return model;
        }

        private Entities.ProcessTypes.ProcessType ParseModelToEntity(ProcessType model)
        {
            var entity = new Entities.ProcessTypes.ProcessType();
            entity.Id = model.Id;
            entity.Title = model.Title != null ? JsonConvert.SerializeObject(model.Title) : "";
            entity.ParentId = model.ParentId;
            entity.JsonValue = JsonConvert.SerializeObject(model.Settings);
            entity.Type = model.Settings.Type;
            entity.RootId = model.Settings.TermSetId;

            return entity;
        }
    }
}
