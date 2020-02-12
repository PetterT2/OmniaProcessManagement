using Omnia.ProcessManagement.Core.Repositories.ShapeGalleryItems;
using Omnia.ProcessManagement.Models.ShapeGalleryItems;
using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Services.ShapeGalleryItems
{
    internal class ShapeGalleryItemService : IShapeGalleryItemService
    {
        IShapeGalleryItemRepository ShapeGalleryItemRepository { get; }
        public ShapeGalleryItemService(IShapeGalleryItemRepository shapeGalleryItemRepository)
        {
            ShapeGalleryItemRepository = shapeGalleryItemRepository;
        }

        public async ValueTask<List<ShapeGalleryItem>> GetAllAsync()
        {
            return await ShapeGalleryItemRepository.GetAllAsync();
        }
        public async ValueTask<ShapeGalleryItem> GetByIdAsync(Guid id)
        {
            return await ShapeGalleryItemRepository.GetByIdAsync(id);
        }

        public async ValueTask<ShapeGalleryItem> AddOrUpdateAsync(ShapeGalleryItem shapeDeclaration)
        {
            return await ShapeGalleryItemRepository.AddOrUpdateAsync(shapeDeclaration);
        }

        public async ValueTask DeleteAsync(Guid id)
        {
            await ShapeGalleryItemRepository.DeleteAsync(id);
        }

        public async ValueTask<bool> AddImageAsync(Guid shapeGalleryItemId, string fileName, string imageBase64)
        {
            var bytes = Convert.FromBase64String(imageBase64);
            return await ShapeGalleryItemRepository.AddImageAsync(shapeGalleryItemId, fileName, bytes);
        }

        public async ValueTask<(MemoryStream, string)> GetImageAsync(Guid shapeGalleryItemId)
        {
            var (bytes, fileName) = await ShapeGalleryItemRepository.GetImageAsync(shapeGalleryItemId);
            return (new MemoryStream(bytes), fileName);
        }
    }
}
