using Omnia.Fx.NetCore.Repositories.EntityFramework.Entities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace Omnia.ProcessManagement.Core.Entities.ShapeGalleryItems
{
    internal class ShapeGalleryItemImage : AuditingEntityBase
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public string FileName { get; set; }
        public byte[] Content { get; set; }
        public Guid ShapeGalleryItemId { get; set; }
        [ForeignKey("ShapeGalleryItemId")]
        public virtual ShapeGalleryItem ShapeGalleryItem { get; set; }
    }
}
