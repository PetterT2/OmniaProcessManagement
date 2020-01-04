﻿
using Omnia.ProcessManagement.Core.Helpers.ProcessQueries;
using Omnia.ProcessManagement.Core.InternalModels.Processes;
using Omnia.ProcessManagement.Models.Images;
using System;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Repositories.Images
{
    internal interface IImageRepository
    {
        ValueTask<ImageReference> AddImageAsync(InternalProcess internalProcess, string fileName, byte[] bytes);
        ValueTask<(ImageReference, byte[])> GetAuthorizedImageAsync(AuthorizedImageReferenceQuery authorizedImageQuery, bool loadImageContent);
    }
}
