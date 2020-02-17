using Omnia.ProcessManagement.Core.Repositories.ShapeTemplates;
using Omnia.ProcessManagement.Models.ShapeTemplates;
using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Services.ShapeTemplates
{
    internal class ShapeTemplateService : IShapeTemplateService
    {
        IShapeTemplateRepository ShapeGalleryItemRepository { get; }
        public ShapeTemplateService(IShapeTemplateRepository shapeGalleryItemRepository)
        {
            ShapeGalleryItemRepository = shapeGalleryItemRepository;
        }

        public async ValueTask<List<ShapeTemplate>> GetAllAsync()
        {
            return await ShapeGalleryItemRepository.GetAllAsync();
        }
        public async ValueTask<ShapeTemplate> GetByIdAsync(Guid id)
        {
            return await ShapeGalleryItemRepository.GetByIdAsync(id);
        }

        public async ValueTask<ShapeTemplate> AddOrUpdateAsync(ShapeTemplate shapeTemplate)
        {
            return await ShapeGalleryItemRepository.AddOrUpdateAsync(shapeTemplate);
        }

        public async ValueTask DeleteAsync(Guid id)
        {
            await ShapeGalleryItemRepository.DeleteAsync(id);
        }

        public async ValueTask<bool> AddImageAsync(Guid shapeTemplateId, string fileName, string imageBase64)
        {
            var bytes = Convert.FromBase64String(imageBase64);
            return await ShapeGalleryItemRepository.AddImageAsync(shapeTemplateId, fileName, bytes);
        }

        public async ValueTask<(byte[], string)> GetImageAsync(Guid shapeTemplateId)
        {
            return await ShapeGalleryItemRepository.GetImageAsync(shapeTemplateId);
        }
    }
}
