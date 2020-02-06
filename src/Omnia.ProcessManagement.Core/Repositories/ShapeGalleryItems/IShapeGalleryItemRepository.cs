using Omnia.ProcessManagement.Models.ShapeGalleryItems;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Repositories.ShapeGalleryItems
{
    internal interface IShapeGalleryItemRepository
    {
        ValueTask<List<ShapeGalleryItem>> GetAllAsync();
        ValueTask<ShapeGalleryItem> GetByIdAsync(Guid id);
        ValueTask<ShapeGalleryItem> AddOrUpdateAsync(ShapeGalleryItem shapeDeclaration);
        ValueTask DeleteAsync(Guid id);
    }
}
