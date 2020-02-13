using Omnia.ProcessManagement.Models.ShapeTemplates;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Repositories.ShapeTemplates
{
    internal interface IShapeTemplateRepository
    {
        ValueTask<List<ShapeTemplate>> GetAllAsync();
        ValueTask<ShapeTemplate> GetByIdAsync(Guid id);
        ValueTask<ShapeTemplate> AddOrUpdateAsync(ShapeTemplate shapeDeclaration);
        ValueTask<bool> AddImageAsync(Guid shapeGalleryItemId, string fileName, byte[] bytes);
        ValueTask<(byte[], string)> GetImageAsync(Guid shapeGalleryItemId);
        ValueTask DeleteAsync(Guid id);
    }
}
