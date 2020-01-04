﻿using Omnia.ProcessManagement.Core.Helpers.ImageHerlpers;
using Omnia.ProcessManagement.Core.InternalModels.Processes;
using Omnia.ProcessManagement.Core.Repositories.Images;
using Omnia.ProcessManagement.Core.Repositories.Processes;
using Omnia.ProcessManagement.Core.Services.Security;
using Omnia.ProcessManagement.Models.Enums;
using Omnia.ProcessManagement.Models.Images;
using System;
using System.Collections.Generic;
using System.IO;
using System.Threading;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Services.Images
{
    internal class ImageService : IImageService
    {
        private static object _lock = new object();
        private static readonly Dictionary<string, SemaphoreSlim> _lockDict = new Dictionary<string, SemaphoreSlim>();
        IImageRepository ImageRepository { get; }
        IProcessSecurityService ProcessSecurityService { get; }
        public ImageService(IImageRepository imageRepository, IProcessSecurityService processSecurityService)
        {
            ImageRepository = imageRepository;
            ProcessSecurityService = processSecurityService;
        }

        public async ValueTask<ImageReference> AddAuthroziedImageAsync(Guid processId, string fileName, string imageBase64)
        {
            var securityResponse = await ProcessSecurityService.InitSecurityResponseByProcessIdAsync(processId);
            return await securityResponse
                .RequireAuthor(ProcessVersionType.CheckedOut)
                .OrRequireReviewer(ProcessVersionType.CheckedOut)
                .DoAsync(async (process) =>
                {
                    var bytes = Convert.FromBase64String(imageBase64);
                    var imageRef = await ImageRepository.AddImageAsync(process, fileName, bytes);

                    var tempFolderPath = EnsureTempFolderPath(imageRef);
                    var tempFileName = imageRef.FileName;
                    var tempFilePath = Path.Combine(tempFolderPath, tempFileName);

                    await File.WriteAllBytesAsync(tempFilePath, bytes);

                    return imageRef;
                });
        }

        public async ValueTask<FileStream> GetAuthroziedImageAsync(ImageReference imageRef)
        {
            var tempFolderPath = EnsureTempFolderPath(imageRef);
            var tempFileName = imageRef.FileName;
            var tempFilePath = Path.Combine(tempFolderPath, tempFileName);

            if (!File.Exists(tempFilePath))
            {

                var semaphoreSlim = EnsureSemaphoreSlim(tempFileName);
                try
                {
                    await semaphoreSlim.WaitAsync();
                    if (!File.Exists(tempFilePath))
                    {
                        var bytes = await GetAuthorizedImageAsync(imageRef, true);
                        await File.WriteAllBytesAsync(tempFilePath, bytes);
                    }
                    else
                    {
                        await GetAuthorizedImageAsync(imageRef, false);
                    }
                }
                finally
                {
                    semaphoreSlim.Release();
                }
            }
            else
            {
                await GetAuthorizedImageAsync(imageRef, false);
            }

            return File.OpenRead(tempFilePath);
        }

        private string EnsureTempFolderPath(ImageReference imageRef)
        {
            var path = Path.Combine(System.IO.Path.GetTempPath(), OPMConstants.ImageTempFolder, imageRef.OPMProcessId.ToString("N"), imageRef.ImageId.ToString());
            Directory.CreateDirectory(path);

            return path;
        }

        private async ValueTask<byte[]> GetAuthorizedImageAsync(ImageReference imageRef, bool loadContent)
        {
            var authorizedImageReferenceQuery = await ProcessSecurityService.InitAuthorizedImageReferenceQueryAsync(imageRef);
            var (authorizedImageRef, bytes) = await ImageRepository.GetAuthorizedImageAsync(authorizedImageReferenceQuery, loadContent);
            if (authorizedImageRef == null)
                throw new UnauthorizedAccessException("Unauthorized");
            if (loadContent && bytes == null)
                throw new FileNotFoundException("Image not found");

            return bytes;
        }

        private SemaphoreSlim EnsureSemaphoreSlim(string key)
        {
            if (!_lockDict.ContainsKey(key))
            {
                lock (_lock)
                {
                    if (!_lockDict.ContainsKey(key))
                    {
                        _lockDict.Add(key, new SemaphoreSlim(1, 1));
                    }
                }
            }

            return _lockDict[key];
        }

    }
}
