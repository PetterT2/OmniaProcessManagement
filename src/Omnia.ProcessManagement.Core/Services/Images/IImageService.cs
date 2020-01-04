using Omnia.ProcessManagement.Models.Enums;
using Omnia.ProcessManagement.Models.Images;
using System;
using System.IO;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Services.Images
{
    public interface IImageService
    {
        ValueTask<ImageReference> AddAuthroziedImageAsync(Guid processId, string fileName, string imageBase64);
        ValueTask<FileStream> GetAuthroziedImageAsync(ImageReference imageRef);
    }
}
