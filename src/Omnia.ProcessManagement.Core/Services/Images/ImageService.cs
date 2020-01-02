using Omnia.ProcessManagement.Core.Helpers.ImageHerlpers;
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

        public async ValueTask<ImageRef> AddImageAsync(Guid processId, string fileName, string imageBase64)
        {
            var imageRef = await ImageRepository.AddImageAsync(processId, fileName, imageBase64);
            return imageRef;
        }

        public async ValueTask<byte[]> GetAuthroziedImageAsync(Guid opmProcessId, ProcessVersionType versionType, ImageRef imageRef)
        {
            ImageHelper.ValidateImageRef(imageRef);

            var securityResponse = await ProcessSecurityService.InitSecurityResponseByOPMProcessIdAsync(opmProcessId, versionType);
            return await securityResponse
                .RequireAuthor()
                .OrRequireApprover(ProcessVersionType.Draft)
                .OrRequireReviewer(ProcessVersionType.Draft, ProcessVersionType.CheckedOut)
                .OrRequireReader(ProcessVersionType.Published)
                .DoAsync(async (_, process) =>
                {
                    var bytes = await EnsureTempImageAsync(process, imageRef);
                    return bytes;
                });
        }


        private async ValueTask<byte[]> EnsureTempImageAsync(InternalProcess internalProcess, ImageRef imageRef)
        {
            var tempFolderPath = Path.Combine(System.IO.Path.GetTempPath(), OPMConstants.ImageTempFolder, internalProcess.OPMProcessId.ToString("N"));
            var tempFileName = GenerateTempFileName(imageRef);

            var teampFilePath = Path.Combine(tempFolderPath, tempFileName);

            Directory.CreateDirectory(tempFolderPath);

            byte[] bytes = null;
            if (!File.Exists(teampFilePath))
            {

                var semaphoreSlim = EnsureSemaphoreSlim(tempFileName);
                try
                {
                    await semaphoreSlim.WaitAsync();
                    if (!File.Exists(teampFilePath))
                    {
                        bytes = await ImageRepository.GetImageAsync(internalProcess.OPMProcessId, imageRef);
                        await File.WriteAllBytesAsync(teampFilePath, bytes);
                    }
                }
                finally
                {
                    semaphoreSlim.Release();
                }
            }

            if (bytes == null)
            {
                bytes = File.ReadAllBytes(teampFilePath);
            }

            return bytes;
        }

        private string GenerateTempFileName(ImageRef imageRef)
        {
            return $"{imageRef.Hash}_{imageRef.FileName}".ToLower();
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
