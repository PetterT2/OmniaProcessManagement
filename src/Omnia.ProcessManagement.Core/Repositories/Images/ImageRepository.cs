using Microsoft.EntityFrameworkCore;
using Omnia.Fx.Utilities;
using Omnia.ProcessManagement.Core.Helpers.ImageHerlpers;
using Omnia.ProcessManagement.Core.Helpers.ProcessQueries;
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

        public async ValueTask<ImageRef> AddImageAsync(InternalProcess internalProcess, string fileName, byte[] bytes)
        {
            fileName = ImageHelper.GetValidFileName(fileName);

            var fileNameWithoutExtension = Path.GetFileNameWithoutExtension(fileName).ToLower();
            var fileExtension = Path.GetExtension(fileName);

            var similarFileNames = await DBContext.Images
                .Where(i => i.ProcessId == internalProcess.Id && i.FileName.StartsWith(fileNameWithoutExtension))
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
            //Instead of creating hash base on the image cotent, we create the hash from a new guid. So even upload a same image two times will have the different hash

            var hash = CommonUtils.CreateMd5Hash(Guid.NewGuid().ToString());
            var image = new Entities.Images.Image()
            {
                ProcessId = internalProcess.Id,
                Content = bytes,
                FileName = fileName,
                Hash = hash
            };

            DBContext.Add(image);
            await DBContext.SaveChangesAsync();

            var imageRef = new ImageRef()
            {
                FileName = fileName,
                Hash = hash,
                OPMProcessId = internalProcess.OPMProcessId
            };

            return imageRef;
        }

        public async ValueTask<(ImageRef, byte[])> GetImageAsync(AuthorizedImageQuery authorizedImageQuery)
        {
            var sql = authorizedImageQuery.GetQuery();
            var image = await DBContext.Images.FromSqlRaw(sql).FirstOrDefaultAsync();
            ImageRef imageRef = null;
            byte[] bytes = null;
            if (image == null)
            {
                imageRef = authorizedImageQuery.ImageRef;
                bytes = image.Content;
            }

            return (imageRef, bytes);
        }
    }
}
