using Omnia.Fx.Models.Users;
using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.ProcessLibrary
{
    public class PublishProcessWithoutApprovalRequest
    {
        public Guid OPMProcessId { get; set; }
        public string WebUrl { get; set; }
        public bool IsRevisionPublishing { get; set; }
        public string Comment { get; set; }
        public bool IsLimitedAccess { get; set; }
        public bool IsReadReceiptRequired { get; set; }
        public List<UserIdentity> LimitedUsers { get; set; }
        public List<UserIdentity> NotifiedUsers { get; set; }
    }

    public class PublishProcessWithApprovalRequest : PublishProcessWithoutApprovalRequest
    {
        public Guid ProcessId { get; set; }
        public DateTime DueDate { get; set; }
        public UserIdentity Approver { get; set; }
    }
}
