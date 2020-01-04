using Omnia.Fx.NetCore.Repositories.EntityFramework.Entities;
using Omnia.ProcessManagement.Core.Entities.Processes;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace Omnia.ProcessManagement.Core.Entities.Images
{
    internal class Image : AuditingEntityBase
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public byte[] Content { get; set; }
        public ICollection<ImageReference> ImageReferences { get; set; }
    }
}
