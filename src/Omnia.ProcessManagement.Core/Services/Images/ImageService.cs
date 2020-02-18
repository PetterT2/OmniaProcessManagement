using Omnia.ProcessManagement.Core.Helpers.ImageHerlpers;
using Omnia.ProcessManagement.Core.InternalModels.Processes;
using Omnia.ProcessManagement.Core.Repositories.Images;
using Omnia.ProcessManagement.Core.Repositories.Processes;
using Omnia.ProcessManagement.Core.Services.Security;
using Omnia.ProcessManagement.Models.Enums;
using Omnia.ProcessManagement.Models.Images;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.Threading;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Services.Images
{
    internal class ImageService : IImageService
    {
        private static object _lock = new object();
        private static readonly ConcurrentDictionary<string, SemaphoreSlim> _lockDict = new ConcurrentDictionary<string, SemaphoreSlim>();
        IImageRepository ImageRepository { get; }
        IProcessSecurityService ProcessSecurityService { get; }
        IProcessRepository ProcessRepository { get; }
        public ImageService(IImageRepository imageRepository, IProcessSecurityService processSecurityService,
            IProcessRepository processRepository)
        {
            ImageRepository = imageRepository;
            ProcessSecurityService = processSecurityService;
            ProcessRepository = processRepository;
        }

        public async ValueTask<string> AddAuthroziedImageAsync(Guid processId, string fileName, byte[] byteData)
        {
            var securityResponse = await ProcessSecurityService.InitSecurityResponseByProcessIdAsync(processId);
            return await securityResponse
                .RequireAuthor(ProcessVersionType.CheckedOut)
                .OrRequireReviewer(ProcessVersionType.CheckedOut)
                .DoAsync(async (process) =>
                {
                    var imageRef = await ImageRepository.AddImageAsync(process, fileName, byteData);

                    var tempFolderPath = EnsureTempFolderPath(imageRef, process.OPMProcessId);
                    var tempFileName = imageRef.FileName;
                    var tempFilePath = Path.Combine(tempFolderPath, tempFileName);

                    await File.WriteAllBytesAsync(tempFilePath, byteData);

                    var imageRelativeApiUrl = ImageHelper.GenerateRelativeApiUrl(imageRef, process.OPMProcessId);

                    return imageRelativeApiUrl;
                });
        }

        public async ValueTask<FileStream> GetImageAsync(ImageReference imageRef, Guid opmProcessId, bool ensureAuthorized = true)
        {
            var tempFolderPath = EnsureTempFolderPath(imageRef, opmProcessId);
            var tempFileName = imageRef.FileName;
            var tempFilePath = Path.Combine(tempFolderPath, tempFileName);

            var isAuthorized = ensureAuthorized ? false : true;

            if (!File.Exists(tempFilePath))
            {

                var semaphoreSlim = EnsureSemaphoreSlim(tempFileName);
                try
                {
                    await semaphoreSlim.WaitAsync();
                    if (!File.Exists(tempFilePath))
                    {
                        byte[] imageContent = null;
                        imageContent = isAuthorized ?
                            await GetImageAsync(imageRef) :
                            await TryGetAuthorizedImageAsync(imageRef, opmProcessId, true);


                        isAuthorized = true;
                        await File.WriteAllBytesAsync(tempFilePath, imageContent);
                    }
                }
                finally
                {
                    semaphoreSlim.Release();
                }
            }

            if (!isAuthorized)
            {

                await TryGetAuthorizedImageAsync(imageRef, opmProcessId, false);
            }

            return File.OpenRead(tempFilePath);
        }

        public async ValueTask<List<ImageReference>> GetImageReferencesAsync(Guid processId)
        {
            return await ImageRepository.GetImageReferencesAsync(processId);
        }

        public async ValueTask DeleteImageReferencesAsync(List<ImageReference> imageReferences, Guid opmProcessId)
        {
            await ProcessRepository.DeleteUnusedImageReferencesAsync(imageReferences, opmProcessId);
        }

        public async ValueTask EnsureDeleteUnusedImageAsync()
        {
            await ImageRepository.EnsureDeleteUnusedImageAsync();
        }

        private string EnsureTempFolderPath(ImageReference imageRef, Guid opmProcessId)
        {
            var path = Path.Combine(System.IO.Path.GetTempPath(), OPMConstants.ImageTempFolder, opmProcessId.ToString("N"), imageRef.ImageId.ToString());
            Directory.CreateDirectory(path);

            return path;
        }

        private async ValueTask<byte[]> GetImageAsync(ImageReference imageRef)
        {
            var bytes = await ImageRepository.GetImageContentAsync(imageRef.ImageId);
            if (bytes == null)
                throw new FileNotFoundException("Image not found");

            return bytes;
        }

        private async ValueTask<byte[]> TryGetAuthorizedImageAsync(ImageReference imageRef, Guid opmProcessId, bool loadContent)
        {
            var authorizedImageReferenceQuery = await ProcessSecurityService.InitAuthorizedImageReferenceQueryAsync(imageRef, opmProcessId);
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
                        _lockDict.TryAdd(key, new SemaphoreSlim(1, 1));
                    }
                }
            }

            return _lockDict[key];
        }

    }
}
