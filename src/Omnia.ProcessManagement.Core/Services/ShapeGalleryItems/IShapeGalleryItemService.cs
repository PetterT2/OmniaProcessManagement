using Omnia.ProcessManagement.Models.ShapeGalleryItems;
using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Services.ShapeGalleryItems
{
    public interface IShapeGalleryItemService
    {
        ValueTask<List<ShapeGalleryItem>> GetAllAsync();
        ValueTask<ShapeGalleryItem> GetByIdAsync(Guid id);
        ValueTask<ShapeGalleryItem> AddOrUpdateAsync(ShapeGalleryItem shapeDeclaration);
        ValueTask<bool> AddImageAsync(Guid shapeGalleryItemId, string fileName, string imageBase64);
        ValueTask<(MemoryStream, string)> GetImageAsync(Guid shapeGalleryItemId);
        ValueTask DeleteAsync(Guid id);
    }
}
