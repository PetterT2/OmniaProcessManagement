using Omnia.Fx.NetCore.Repositories.EntityFramework.Entities;
using Omnia.ProcessManagement.Core.Entities.Processes;
using Omnia.ProcessManagement.Models.Workflows;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Omnia.ProcessManagement.Core.Entities.Workflows
{  
    internal class Workflow : ClusteredIndexAuditingEntityBase
    {
        [Key]
        public Guid Id { get; set; }
        public Guid ProcessId { get; set; }
        public string JsonValue { get; set; }
        public WorkflowType Type { get; set; }
        public WorkflowCompletedType CompletedType { get; set; }
        public DateTimeOffset? DueDate { get; set; }
        public string Comment { get; set; }
        
        public Process Process { get; set; }
        public ICollection<WorkflowTask> WorkflowTasks { get; set; }
    }
}
