using Newtonsoft.Json;
using Omnia.ProcessManagement.Models.Images;
using System;
using System.Text.RegularExpressions;

namespace Omnia.ProcessManagement.Core.Helpers.ImageHerlpers
{
    public class ImageHelper
    {
        public static string GetValidFileName(string fileName)
        {
            fileName = fileName.ToLower().Trim();
            fileName = Regex.Replace(fileName, @"[^0-9a-zA-Z.]+", "-");

            var fileWithoutExtension = System.IO.Path.GetFileNameWithoutExtension(fileName);
            fileWithoutExtension = Regex.Replace(fileWithoutExtension, @"[^0-9a-zA-Z]+", "-");
            var fileExtension = System.IO.Path.GetExtension(fileName);

            return fileWithoutExtension + fileExtension;
        }

        public static void ValidateImageRef(ImageRef imageRef)
        {
            var fileName = imageRef.FileName;
            var validFileName = GetValidFileName(fileName);
            if (validFileName != fileName)
                throw new Exception($"Invalid ImageRef: {JsonConvert.SerializeObject(imageRef)}");
        }
    }
}
