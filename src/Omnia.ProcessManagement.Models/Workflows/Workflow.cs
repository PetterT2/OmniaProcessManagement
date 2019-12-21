using Omnia.Fx.Models.JsonTypes;
using Omnia.ProcessManagement.Models.Enums;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Omnia.ProcessManagement.Models.Workflows
{
    public class Workflow : AuditingInformation
    {
        public Workflow()
        {
            Id = Guid.NewGuid();
        }

        public Guid Id { get; set; }

        public Guid OPMProcessId { get; set; }

        public WorkflowCompletedType CompletedType { get; set; }

        public DateTimeOffset? DueDate { get; set; }

        public bool CanCancelByUser { get; set; }

        public WorkflowData WorkflowData { get; set; }

        public List<WorkflowTask> WorkflowTasks { get; set; }
    }

    public class WorkflowData : OmniaJsonBase
    {
        public virtual WorkflowType Type { get; set; }
        public string Comment { get; set; }
    }
}
