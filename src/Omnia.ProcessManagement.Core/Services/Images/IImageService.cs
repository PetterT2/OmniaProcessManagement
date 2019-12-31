using Omnia.ProcessManagement.Models.Enums;
using Omnia.ProcessManagement.Models.Images;
using System;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Services.Images
{
    public interface IImageService
    {
        ValueTask<ImageRef> AddImageAsync(Guid processId, string fileName, string imageBase64);
        ValueTask<byte[]> GetAuthroziedImageAsync(Guid opmProcessId, ProcessVersionType versionType, ImageRef imageRef);
    }
}
