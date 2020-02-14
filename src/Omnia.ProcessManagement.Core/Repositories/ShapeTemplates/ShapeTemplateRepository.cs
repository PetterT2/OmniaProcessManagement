using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Omnia.Fx.Models.Extensions;
using Omnia.ProcessManagement.Models.ShapeTemplates;
using Omnia.ProcessManagement.Models.Shapes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Omnia.Fx.Models.Language;

namespace Omnia.ProcessManagement.Core.Repositories.ShapeTemplates
{
    internal class ShapeTemplateRepository : IShapeTemplateRepository
    {
        OmniaPMDbContext DBContext { get; }

        public ShapeTemplateRepository(OmniaPMDbContext databaseContext)
        {
            DBContext = databaseContext;
        }

        public async ValueTask<List<ShapeTemplate>> GetAllAsync()
        {
            var entities = await DBContext.ShapeTemplates.Where(d => d.DeletedAt == null).ToListAsync();
            var models = ParseEntitiesToModels(entities);
            return models;
        }

        public async ValueTask<ShapeTemplate> GetByIdAsync(Guid id)
        {
            var entity = await DBContext.ShapeTemplates.Where(d => d.Id == id && d.DeletedAt == null).FirstOrDefaultAsync();
            return ParseEntityToModel(entity);
        }

        public async ValueTask<ShapeTemplate> AddOrUpdateAsync(ShapeTemplate shapeTemplate)
        {
            var entity = ParseModelToEntity(shapeTemplate);
            var existingShapeTemplate = shapeTemplate.Id != Guid.Empty ? await DBContext.ShapeTemplates.AsTracking().FirstOrDefaultAsync(d => d.Id == shapeTemplate.Id && d.DeletedAt == null) : null;
            if (existingShapeTemplate == null)
            {
                existingShapeTemplate = new Entities.ShapeTemplates.ShapeTemplate
                {
                    Id = shapeTemplate.Id != Guid.Empty ? shapeTemplate.Id : Guid.NewGuid(),
                    BuiltIn = shapeTemplate.BuiltIn,
                    Title = entity.Title,
                    JsonValue = entity.JsonValue
                };
                DBContext.ShapeTemplates.Add(existingShapeTemplate);
            }
            else
            {
                existingShapeTemplate.JsonValue = entity.JsonValue;
            }

            await DBContext.SaveChangesAsync();

            return ParseEntityToModel(existingShapeTemplate);
        }

        public async ValueTask<bool> AddImageAsync(Guid shapeTemplateId, string fileName, byte[] bytes)
        {
            var shapeTemplateImage = new Entities.ShapeTemplates.ShapeTemplateImage()
            {
                Content = bytes,
                ShapeTemplateId = shapeTemplateId,
                FileName = fileName
            };

            DBContext.ShapeTemplateImages.Add(shapeTemplateImage);

            await DBContext.SaveChangesAsync();

            return true;
        }

        public async ValueTask<(byte[], string)> GetImageAsync(Guid shapeTemplateId)
        {
            var imageData = await DBContext.ShapeTemplateImages.FirstOrDefaultAsync(i => i.ShapeTemplateId == shapeTemplateId);
            if (imageData != null)
            {
                return (imageData.Content, imageData.FileName);
            }
            else return (null, String.Empty);
        }

        public async ValueTask DeleteAsync(Guid id)
        {
            var exstingEntity = await DBContext.ShapeTemplates.AsTracking().FirstOrDefaultAsync(d => d.DeletedAt == null && d.Id == id);
            if (exstingEntity != null)
            {
                var shapeTemplateModel = ParseEntityToModel(exstingEntity);
                if(shapeTemplateModel.Id == OPMConstants.Features.DefaultShapeTemplates.Media.Id)
                {
                    var existingImageEntity = await DBContext.ShapeTemplateImages.AsTracking().FirstOrDefaultAsync(i => i.ShapeTemplateId == exstingEntity.Id);
                    if(existingImageEntity != null)
                    {
                        existingImageEntity.DeletedAt = DateTimeOffset.UtcNow;
                    }
                }
                exstingEntity.DeletedAt = DateTimeOffset.UtcNow;
                await DBContext.SaveChangesAsync();
            }
        }

        private List<ShapeTemplate> ParseEntitiesToModels(IList<Entities.ShapeTemplates.ShapeTemplate> entities)
        {
            var result = entities.Select(this.ParseEntityToModel).ToList();
            return result;
        }

        private ShapeTemplate ParseEntityToModel(Entities.ShapeTemplates.ShapeTemplate entity)
        {
            ShapeTemplate model = null;
            if (entity != null)
            {
                model = new ShapeTemplate();
                model.Id = entity.Id;
                model.BuiltIn = entity.BuiltIn;
                model. Title = string.IsNullOrWhiteSpace(entity.Title) ? new MultilingualString() : JsonConvert.DeserializeObject<MultilingualString>(entity.Title);
                model.Settings = string.IsNullOrWhiteSpace(entity.JsonValue) ? new ShapeTemplateSettings() : JsonConvert.DeserializeObject<ShapeTemplateSettings>(entity.JsonValue);
            }

            return model;
        }

        private Entities.ShapeTemplates.ShapeTemplate ParseModelToEntity(ShapeTemplate model)
        {
            var entity = new Entities.ShapeTemplates.ShapeTemplate();
            entity.Id = model.Id;
            entity.BuiltIn = model.BuiltIn;
            entity.Title = model.Title != null ? JsonConvert.SerializeObject(model.Title) : "";
            entity.JsonValue = model.Settings != null ? JsonConvert.SerializeObject(model.Settings) : "";

            return entity;
        }
    }
}
