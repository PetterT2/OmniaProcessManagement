using Omnia.ProcessManagement.Models.ShapeTemplates;
using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Services.ShapeTemplates
{
    public interface IShapeTemplateService
    {
        ValueTask<List<ShapeTemplate>> GetAllAsync();
        ValueTask<ShapeTemplate> GetByIdAsync(Guid id);
        ValueTask<ShapeTemplate> AddOrUpdateAsync(ShapeTemplate shapeDeclaration);
        ValueTask<bool> AddImageAsync(Guid shapeGalleryItemId, string fileName, string imageBase64);
        ValueTask<(MemoryStream, string)> GetImageAsync(Guid shapeGalleryItemId);
        ValueTask DeleteAsync(Guid id);
    }
}
