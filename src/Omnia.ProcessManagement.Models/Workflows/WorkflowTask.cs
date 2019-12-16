using Omnia.ProcessManagement.Models.Processes;
using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.Workflows
{
    public enum TaskStatus : byte
    {
        NotStarted = 1,
        InProgress = 2,
        Completed = 3,
        Deferred = 4,
        WaitingOnSomeoneElse = 5,
        Cancel = 6
    }
    public enum TaskOutcome : byte
    {
        Approved = 1,
        Rejected = 2
    }

    public class WorkflowTask : AuditingInformation
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
        }

        public Guid Id { get; set; }

        public Guid WorkflowId { get; set; }

        public bool IsCompleted { get; set; }

        public string Comment { get; set; }

        public string AssignedUser { get; set; }

        public int SPTaskId { get; set; }

        public TaskOutcome TaskOutcome { get; set; }

        public Workflow Workflow { get; set; }
    }
}
