using Omnia.Fx.Models.Users;
using Omnia.ProcessManagement.Models.Enums;
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

        public override WorkflowType Type
        {
            get
            {
                return WorkflowType.Approval;
            }
        }

        public bool IsRevisionPublishing { get; set; }
        public bool IsLimitedAccess { get; set; }
        public List<UserIdentity> LimitedUsers { get; set; }
        public UserIdentity Approver { get; set; }
    }
}
