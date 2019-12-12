using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.Workflows
{
    public class WorkflowApprovalData : WorkflowData
    {
        public WorkflowApprovalData()
        {

        }
        public bool IsRevisionPublishing { get; set; }
    }
}
