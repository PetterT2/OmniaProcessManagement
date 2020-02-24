using Newtonsoft.Json;
using Omnia.ProcessManagement.Models.Images;
using System;
using System.Collections.Generic;
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

        public static void ValidateImageRef(ImageReference imageRef)
        {
            var fileName = imageRef.FileName;
            var validFileName = GetValidFileName(fileName);
            if (validFileName != fileName)
                throw new Exception($"Invalid ImageRef: {JsonConvert.SerializeObject(imageRef)}");
        }

        public static string GenerateRelativeApiUrl(ImageReference imageRef, Guid opmProcessId)
        {
            return $"/api/images/{opmProcessId}/{imageRef.ImageId}/{imageRef.FileName}".ToLower();
        }

        public static List<int> GetImageIds(string imageUrl, Guid opmProcessId)
        {
            try
            {
                List<int> ids = new List<int>();
                MatchCollection matchs = Regex.Matches(imageUrl, @"\b" + $"/api/images/{opmProcessId}/" + @"\b\d+", RegexOptions.Singleline | RegexOptions.IgnoreCase);
                foreach (Match match in matchs)
                {
                    string[] strs = match.Value.Split('/');
                    ids.Add(int.Parse(strs[strs.Length - 1]));
                }
                return ids;
            }
            catch (Exception ex)
            {
                throw new Exception($"Can't clone Image Reference: {imageUrl} - {ex.Message}");
            }
        }
    }
}
