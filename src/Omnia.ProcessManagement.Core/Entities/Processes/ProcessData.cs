using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace Omnia.ProcessManagement.Core.Entities.Processes
{
    internal class ProcessData : OPMClusteredIndexAuditingEntityBase
    {
        public Guid ProcessStepId { get; set; }
        public Guid ProcessId { get; set; }
        public string ReferenceProcessStepIds { get; set; }
        public string JsonValue { get; set; }
        public string Hash { get; set; }

        [ForeignKey("ProcessId")]
        public virtual Process Process { get; set; }
    }
}
