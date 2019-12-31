
using Omnia.ProcessManagement.Core.InternalModels.Processes;
using Omnia.ProcessManagement.Models.Images;
using System;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Repositories.Images
{
    internal interface IImageRepository
    {
        ValueTask<ImageRef> AddImageAsync(Guid processId, string fileName, string imageBase64);
        ValueTask<byte[]> GetImageAsync(Guid opmProcessId, ImageRef imageRef);
    }
}
