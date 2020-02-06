using Omnia.Fx.NetCore.Repositories.EntityFramework.Entities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Omnia.ProcessManagement.Core.Entities.ShapeGalleryItems
{
    internal class ShapeGalleryItem : ClusteredIndexAuditingEntityBase
    {
        [Key]
        public Guid Id { get; set; }
        public bool BuiltIn { get; set; }
        public string JsonValue { get; set; }
    }
}
