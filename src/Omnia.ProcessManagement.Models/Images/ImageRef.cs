using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.Images
{
    public class ImageRef
    {
        public string FileName { get; set; }
        public string Hash { get; set; }

        public string GetTempFileName()
        {
            return $"{Hash}_{FileName}";
        }
    }
}
