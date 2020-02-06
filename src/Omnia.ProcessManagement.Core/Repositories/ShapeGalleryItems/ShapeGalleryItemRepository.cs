using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Omnia.ProcessManagement.Models.ShapeGalleryItems;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Repositories.ShapeGalleryItems
{
    internal class ShapeGalleryItemRepository : RepositoryBase<Entities.ShapeGalleryItems.ShapeGalleryItem>, IShapeGalleryItemRepository
    {
        public ShapeGalleryItemRepository(OmniaPMDbContext databaseContext) : base(databaseContext)
        {
        }

        public async ValueTask<List<ShapeGalleryItem>> GetAllAsync()
        {
            var entities = await _dbSet.Where(d => d.DeletedAt == null).ToListAsync();
            var models = ParseEntitiesToModels(entities);
            return models;
        }

        public async ValueTask<ShapeGalleryItem> GetByIdAsync(Guid id)
        {
            var entity = await _dbSet.Where(d => d.Id == id && d.DeletedAt == null).FirstOrDefaultAsync();
            return ParseEntityToModel(entity);
        }

        public async ValueTask<ShapeGalleryItem> AddOrUpdateAsync(ShapeGalleryItem shapeDeclaration)
        {
            var entity = ParseModelToEntity(shapeDeclaration);
            var existingShapeDeclaration = shapeDeclaration.Id != Guid.Empty ? await _dbSet.AsTracking().FirstOrDefaultAsync(d => d.Id == shapeDeclaration.Id && d.DeletedAt == null) : null;
            if (existingShapeDeclaration == null)
            {
                existingShapeDeclaration = new Entities.ShapeGalleryItems.ShapeGalleryItem
                {
                    Id = shapeDeclaration.Id != Guid.Empty ? shapeDeclaration.Id : Guid.NewGuid(),
                    JsonValue = entity.JsonValue
                };
                _dbSet.Add(existingShapeDeclaration);
            }
            else
            {
                existingShapeDeclaration.JsonValue = entity.JsonValue;
            }

            await _dataContext.SaveChangesAsync();

            return ParseEntityToModel(existingShapeDeclaration);
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

        private List<ShapeGalleryItem> ParseEntitiesToModels(IList<Entities.ShapeGalleryItems.ShapeGalleryItem> entities)
        {
            var result = entities.Select(this.ParseEntityToModel).ToList();
            return result;
        }

        private ShapeGalleryItem ParseEntityToModel(Entities.ShapeGalleryItems.ShapeGalleryItem entity)
        {
            ShapeGalleryItem model = null;
            if (entity != null)
            {
                model = new ShapeGalleryItem();
                model.Id = entity.Id;
                model.Settings = string.IsNullOrWhiteSpace(entity.JsonValue) ? new ShapeGalleryItemSettings() : JsonConvert.DeserializeObject<ShapeGalleryItemSettings>(entity.JsonValue);
            }

            return model;
        }

        private Entities.ShapeGalleryItems.ShapeGalleryItem ParseModelToEntity(ShapeGalleryItem model)
        {
            var entity = new Entities.ShapeGalleryItems.ShapeGalleryItem();
            entity.Id = model.Id;
            entity.JsonValue = model.Settings != null ? JsonConvert.SerializeObject(model.Settings) : "";

            return entity;
        }
    }
}
