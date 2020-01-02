using Microsoft.EntityFrameworkCore;
using Omnia.Fx.Utilities;
using Omnia.ProcessManagement.Core.Helpers.ImageHerlpers;
using Omnia.ProcessManagement.Core.InternalModels.Processes;
using Omnia.ProcessManagement.Models.Images;
using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Repositories.Images
{
    internal class ImageRepository : IImageRepository
    {
        OmniaPMDbContext DBContext { get; }
        public ImageRepository(OmniaPMDbContext databaseContext)
        {
            DBContext = databaseContext;
        }

        public async ValueTask<ImageRef> AddImageAsync(Guid processId, string fileName, string imageBase64)
        {
            fileName = ImageHelper.GetValidFileName(fileName);

            var fileNameWithoutExtension = Path.GetFileNameWithoutExtension(fileName).ToLower();
            var fileExtension = Path.GetExtension(fileName);

            var similarFileNames = await DBContext.Images
                .Where(i => i.ProcessId == processId && i.FileName.StartsWith(fileNameWithoutExtension))
                .Select(i => i.FileName)
                .ToListAsync();
            var similarFileNamesHashset = similarFileNames.Select(f => f.ToLower()).ToHashSet();


            var fileCount = 0;
            while (similarFileNamesHashset.Contains(fileName))
            {
                fileName = fileNameWithoutExtension + fileCount + fileExtension;
                fileCount++;
            }

            //var hash = CommonUtils.CreateMd5Hash(imageBase64);
            //We create the hash from a new guid. So even upload a same image two times will have the different hash
            var hash = CommonUtils.CreateMd5Hash(Guid.NewGuid().ToString());
            var image = new Entities.Images.Image()
            {
                ProcessId = processId,
                Content = Convert.FromBase64String(imageBase64),
                FileName = fileName,
                Hash = hash
            };

            DBContext.Add(image);
            await DBContext.SaveChangesAsync();

            var imageRef = new ImageRef()
            {
                FileName = fileName,
                Hash = hash
            };

            return imageRef;
        }

        public async ValueTask<byte[]> GetImageAsync(Guid opmProcessId, ImageRef imageRef)
        {
            var image = await DBContext.Images.Where(i => i.FileName == imageRef.FileName && i.Hash == imageRef.Hash && i.Process.OPMProcessId == opmProcessId)
                .FirstOrDefaultAsync();

            if (image == null)
            {
                throw new Exception("Image not found");
            }

            return image.Content;
        }
    }
}
