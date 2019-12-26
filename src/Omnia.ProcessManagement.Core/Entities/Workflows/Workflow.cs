using Omnia.Fx.NetCore.Repositories.EntityFramework.Entities;
using Omnia.ProcessManagement.Core.Entities.Processes;
using Omnia.ProcessManagement.Models.Enums;
using Omnia.ProcessManagement.Models.Workflows;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Omnia.ProcessManagement.Core.Entities.Workflows
{
    internal class Workflow : OPMClusteredIndexAuditingEntityBase
    {
        [Key]
        public Guid Id { get; set; }
        public Guid OPMProcessId { get; set; }
        public int Edition { get; set; }
        public string JsonValue { get; set; }
        public WorkflowType Type { get; set; }
        public WorkflowCompletedType CompletedType { get; set; }
        public DateTimeOffset? DueDate { get; set; }
        public ICollection<WorkflowTask> WorkflowTasks { get; set; }
    }
}
