using Omnia.Fx.NetCore.Repositories.EntityFramework.Entities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace Omnia.ProcessManagement.Core.Entities.ShapeTemplates
{
    internal class ShapeTemplateImage : AuditingEntityBase
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public string FileName { get; set; }
        public byte[] Content { get; set; }
        public Guid ShapeTemplateId { get; set; }
        [ForeignKey("ShapeTemplateId")]
        public virtual ShapeTemplate ShapeTemplate { get; set; }
    }
}
