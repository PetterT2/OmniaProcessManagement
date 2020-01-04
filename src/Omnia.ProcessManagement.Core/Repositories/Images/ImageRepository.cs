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

        public async ValueTask<ImageReference> AddImageAsync(InternalProcess internalProcess, string fileName, byte[] bytes)
        {
            fileName = ImageHelper.GetValidFileName(fileName);

            var fileNameWithoutExtension = Path.GetFileNameWithoutExtension(fileName).ToLower();
            var fileExtension = Path.GetExtension(fileName);

            var similarFileNames = await DBContext.ImageReferences
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


            var image = new Entities.Images.Image()
            {
                Content = bytes
            };
            DBContext.Images.Add(image);

            var imageReference = new Entities.Images.ImageReference()
            {
                FileName = fileName,
                Image = image,
                ProcessId = internalProcess.Id
            };
            DBContext.ImageReferences.Add(imageReference);

            await DBContext.SaveChangesAsync();

            var imageRef = new ImageReference()
            {
                FileName = fileName,
                OPMProcessId = internalProcess.OPMProcessId,
                ImageId = image.Id
            };

            return imageRef;
        }

        public async ValueTask<(ImageReference, byte[])> GetAuthorizedImageAsync(AuthorizedImageReferenceQuery authorizedImageQuery, bool loadImageContent)
        {
            var sql = authorizedImageQuery.GetQuery();
            var imageReferenceEf = await DBContext.ImageReferences.FromSqlRaw(sql).FirstOrDefaultAsync();
            ImageReference imageReference = null;
            byte[] imageContent = null;

            if (imageReferenceEf != null)
            {
                imageReference = authorizedImageQuery.ImageRef;
                if (loadImageContent)
                {
                    var image = await DBContext.Images.FirstOrDefaultAsync(i => i.Id == imageReference.ImageId);
                    imageContent = image?.Content;
                }
            }


            return (imageReference, imageContent);
        }
    }
}
