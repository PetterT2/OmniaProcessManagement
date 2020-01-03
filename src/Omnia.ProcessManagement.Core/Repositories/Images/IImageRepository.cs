
using Omnia.ProcessManagement.Core.Helpers.ProcessQueries;
using Omnia.ProcessManagement.Core.InternalModels.Processes;
using Omnia.ProcessManagement.Models.Images;
using System;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Repositories.Images
{
    internal interface IImageRepository
    {
        ValueTask<ImageRef> AddImageAsync(InternalProcess internalProcess, string fileName, byte[] bytes);
        ValueTask<(ImageRef, byte[])> GetImageAsync(AuthorizedImageQuery authorizedImageQuery);
    }
}
