using System;
using System.Collections.Generic;
using System.IO;
using System.Text;

namespace Omnia.ProcessManagement.Models.Images
{
    public class ImageRef
    {
        public Guid OPMProcessId { get; set; }
        public string FileName { get; set; }
        public string Hash { get; set; }
    }
}
