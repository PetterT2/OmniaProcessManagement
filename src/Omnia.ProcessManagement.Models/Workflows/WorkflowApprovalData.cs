using Omnia.Fx.Models.Users;
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

        public bool IsLimitedAccess { get; set; }
        public List<UserIdentity> LimitedUsers { get; set; }
    }
}
