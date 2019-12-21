using Omnia.Fx.Models.Users;
using Omnia.ProcessManagement.Models.Processes;
using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.Workflows
{
    public class WorkflowApprovalTask : WorkflowTask
    {
        public WorkflowApprovalTask()
        {

        }

        public WorkflowApprovalTask(WorkflowTask workflowTask) : base(workflowTask)
        {

        }

        public Process Process { get; set; }
        public bool Responsible { get; set; }
    }
}
