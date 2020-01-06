using Omnia.ProcessManagement.Core.InternalModels.Processes;
using Omnia.ProcessManagement.Models.Enums;
using Omnia.ProcessManagement.Models.Images;
using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Services.Images
{
    public interface IImageService
    {
        ValueTask<string> AddAuthroziedImageAsync(Guid processId, string fileName, string imageBase64);
        ValueTask<FileStream> GetImageAsync(ImageReference imageRef, Guid opmProcessId, bool ensureAuthorized = true);
        ValueTask<List<ImageReference>> GetImageReferencesAsync(Guid processId);
        ValueTask DeleteImageReferencesAsync(List<ImageReference> imageReferences, Guid opmProcessId);
        ValueTask EnsureDeleteUnusedImageAsync();
    }
}
