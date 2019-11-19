using Omnia.Fx.Models.Language;
using Omnia.Fx.NetCore.Repositories.EntityFramework.Entities;
using Omnia.ProcessManagement.Models.Processes;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace Omnia.ProcessManagement.Core.Entities.Processes
{
    internal class ProcessData : OPMClusteredIndexAuditingEntityBase
    {
        public Guid InternalProcessItemId { get; set; }
        public Guid ProcessId { get; set; }
        public string ReferenceProcessItemIds { get; set; }
        public string JsonValue { get; set; }
        public string Hash { get; set; }

        [ForeignKey("ProcessId")]
        public virtual Process Process { get; set; }
    }
}
