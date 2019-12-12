using Omnia.Fx.Models.JsonTypes;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Omnia.ProcessManagement.Models.Workflows
{
    public enum WorkflowType : byte
    {
        ReviewWorkflow = 1,
        PublishWorkflow = 2,
        CreateDraft = 3,
        MovedProcess = 4
    }

    public enum WorkflowCompletedType : byte
    {
        None = 0,
        AllTasksDone = 1,
        MeetDueDate = 2,
        Cancelled = 3
    }

    public class Workflow : AuditingInformation
    {
        public Workflow()
        {
            Id = Guid.NewGuid();
        }

        public Guid Id { get; set; }

        public Guid ProcessId { get; set; }

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
