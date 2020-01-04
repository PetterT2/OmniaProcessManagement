using System;
using System.Collections.Generic;
using System.IO;
using System.Text;

namespace Omnia.ProcessManagement.Models.Images
{
    public class ImageReference
    {
        public Guid OPMProcessId { get; set; }
        public string FileName { get; set; }
        public int ImageId { get; set; }
    }
}
