using Omnia.ProcessManagement.Models.Enums;
using Omnia.ProcessManagement.Models.Processes;
using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.Workflows
{
    /// <summary>
    /// This enum is defined SharePoint task statuses
    /// We only allow to use some status in OPM
    /// </summary>
    public enum TaskStatus : byte
    {
        [Obsolete("Don't use this", true)]
        NotStarted = 1,
        [Obsolete("Don't use this", true)]
        InProgress = 2,
        Completed = 3,
        [Obsolete("Don't use this", true)]
        Deferred = 4,
        [Obsolete("Don't use this", true)]
        WaitingOnSomeoneElse = 5,
        Cancel = 6
    }

    public class WorkflowTask
    {
        public WorkflowTask()
        {
        }

        public WorkflowTask(WorkflowTask workflowTask)
        {
            Id = workflowTask.Id;
            WorkflowId = workflowTask.WorkflowId;
            IsCompleted = workflowTask.IsCompleted;
            Comment = workflowTask.Comment;
            AssignedUser = workflowTask.AssignedUser;
            SPTaskId = workflowTask.SPTaskId;
            TaskOutcome = workflowTask.TaskOutcome;
            Workflow = workflowTask.Workflow;
            CreatedAt = workflowTask.CreatedAt;
            CreatedBy = workflowTask.CreatedBy;
        }
        public Guid Id { get; set; }

        public Guid WorkflowId { get; set; }

        public bool IsCompleted { get; set; }

        public string Comment { get; set; }

        public string AssignedUser { get; set; }

        public int SPTaskId { get; set; }

        public Guid TeamAppId { get; set; }

        public TaskOutcome TaskOutcome { get; set; }

        public Workflow Workflow { get; set; }

        public string CreatedBy { get; set; }

        public DateTimeOffset CreatedAt { get; set; }
    }
}
