using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace Omnia.ProcessManagement.Core.Entities
{
    internal abstract class OPMClusteredIndexAuditingEntityBase : OPMAuditingEntityBase
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public long ClusteredId { get; set; }
    }
}
