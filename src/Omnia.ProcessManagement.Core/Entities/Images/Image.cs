using Omnia.Fx.NetCore.Repositories.EntityFramework.Entities;
using Omnia.ProcessManagement.Core.Entities.Processes;
using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace Omnia.ProcessManagement.Core.Entities.Images
{
    internal class Image : ClusteredIndexAuditingEntityBase
    {
        public Guid ProcessId { get; set; }
        public string FileName { get; set; }
        public byte[] Content { get; set; }
        public string Hash { get; set; }

        [ForeignKey("ProcessId")]
        public virtual Process Process { get; set; }
    }
}
