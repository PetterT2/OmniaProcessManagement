using Omnia.ProcessManagement.Core.Repositories.ShapeGalleryItems;
using Omnia.ProcessManagement.Models.ShapeGalleryItems;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Services.ShapeGalleryItems
{
    internal class ShapeGalleryItemService : IShapeGalleryItemService
    {
        IShapeGalleryItemRepository ShapeDeclarationRepository { get; }
        public ShapeGalleryItemService(IShapeGalleryItemRepository shapeDeclarationRepository)
        {
            ShapeDeclarationRepository = shapeDeclarationRepository;
        }

        public async ValueTask<List<ShapeGalleryItem>> GetAllAsync()
        {
            return await ShapeDeclarationRepository.GetAllAsync();
        }
        public async ValueTask<ShapeGalleryItem> GetByIdAsync(Guid id)
        {
            return await ShapeDeclarationRepository.GetByIdAsync(id);
        }

        public async ValueTask<ShapeGalleryItem> AddOrUpdateAsync(ShapeGalleryItem shapeDeclaration)
        {
            return await ShapeDeclarationRepository.AddOrUpdateAsync(shapeDeclaration);
        }

        public async ValueTask DeleteAsync(Guid id)
        {
            await ShapeDeclarationRepository.DeleteAsync(id);
        }
    }
}
