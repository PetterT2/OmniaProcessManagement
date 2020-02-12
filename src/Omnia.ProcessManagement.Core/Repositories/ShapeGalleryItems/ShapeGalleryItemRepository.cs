using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Omnia.Fx.Models.Extensions;
using Omnia.ProcessManagement.Models.ShapeGalleryItems;
using Omnia.ProcessManagement.Models.Shapes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Repositories.ShapeGalleryItems
{
    internal class ShapeGalleryItemRepository : IShapeGalleryItemRepository
    {
        OmniaPMDbContext DBContext { get; }

        public ShapeGalleryItemRepository(OmniaPMDbContext databaseContext)
        {
            DBContext = databaseContext;
        }

        public async ValueTask<List<ShapeGalleryItem>> GetAllAsync()
        {
            var entities = await DBContext.ShapeGalleryItems.Where(d => d.DeletedAt == null).ToListAsync();
            var models = ParseEntitiesToModels(entities);
            return models;
        }

        public async ValueTask<ShapeGalleryItem> GetByIdAsync(Guid id)
        {
            var entity = await DBContext.ShapeGalleryItems.Where(d => d.Id == id && d.DeletedAt == null).FirstOrDefaultAsync();
            return ParseEntityToModel(entity);
        }

        public async ValueTask<ShapeGalleryItem> AddOrUpdateAsync(ShapeGalleryItem shapeDeclaration)
        {
            var entity = ParseModelToEntity(shapeDeclaration);
            var existingShapeDeclaration = shapeDeclaration.Id != Guid.Empty ? await DBContext.ShapeGalleryItems.AsTracking().FirstOrDefaultAsync(d => d.Id == shapeDeclaration.Id && d.DeletedAt == null) : null;
            if (existingShapeDeclaration == null)
            {
                existingShapeDeclaration = new Entities.ShapeGalleryItems.ShapeGalleryItem
                {
                    Id = shapeDeclaration.Id != Guid.Empty ? shapeDeclaration.Id : Guid.NewGuid(),
                    JsonValue = entity.JsonValue
                };
                DBContext.ShapeGalleryItems.Add(existingShapeDeclaration);
            }
            else
            {
                existingShapeDeclaration.JsonValue = entity.JsonValue;
            }

            await DBContext.SaveChangesAsync();

            return ParseEntityToModel(existingShapeDeclaration);
        }

        public async ValueTask<bool> AddImageAsync(Guid shapeGalleryItemId, string fileName, byte[] bytes)
        {
            var galleryItemImage = new Entities.ShapeGalleryItems.ShapeGalleryItemImage()
            {
                Content = bytes,
                ShapeGalleryItemId = shapeGalleryItemId,
                FileName = fileName
            };

            DBContext.ShapeGalleryItemImages.Add(galleryItemImage);

            await DBContext.SaveChangesAsync();

            return true;
        }

        public async ValueTask<(byte[], string)> GetImageAsync(Guid shapeGalleryItemId)
        {
            var imageData = await DBContext.ShapeGalleryItemImages.FirstOrDefaultAsync(i => i.ShapeGalleryItemId == shapeGalleryItemId);
            if (imageData != null)
            {
                return (imageData.Content, imageData.FileName);
            }
            else return (null, String.Empty);
        }

        public async ValueTask DeleteAsync(Guid id)
        {
            var exstingEntity = await DBContext.ShapeGalleryItems.AsTracking().FirstOrDefaultAsync(d => d.DeletedAt == null && d.Id == id);
            if (exstingEntity != null)
            {
                var shapeGalleryItemModel = ParseEntityToModel(exstingEntity);
                if(shapeGalleryItemModel.Settings.ShapeDefinition.ShapeTemplate.Id == OPMConstants.Features.OPMDefaultShapeGalleryItems.Media.Id)
                {
                    var existingImageEntity = await DBContext.ShapeGalleryItemImages.AsTracking().FirstOrDefaultAsync(i => i.ShapeGalleryItemId == exstingEntity.Id);
                    if(existingImageEntity != null)
                    {
                        existingImageEntity.DeletedAt = DateTimeOffset.UtcNow;
                    }
                }
                exstingEntity.DeletedAt = DateTimeOffset.UtcNow;
                await DBContext.SaveChangesAsync();
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
