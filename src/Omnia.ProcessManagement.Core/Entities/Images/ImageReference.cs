using Omnia.Fx.NetCore.Repositories.EntityFramework.Entities;
using Omnia.ProcessManagement.Core.Entities.Processes;
using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace Omnia.ProcessManagement.Core.Entities.Images
{
    internal class ImageReference
    {
        public Guid ProcessId { get; set; }
        public string FileName { get; set; }
        public int ImageId { get; set; }

        [ForeignKey("ProcessId")]
        public virtual Process Process { get; set; }
        [ForeignKey("ImageId")]
        public virtual Image Image { get; set; }
    }
}
