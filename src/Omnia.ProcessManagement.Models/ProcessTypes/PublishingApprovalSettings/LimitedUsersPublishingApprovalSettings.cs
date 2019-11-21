using Omnia.Fx.Models.Users;
using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.ProcessTypes.PublishingApprovalSettings
{
    public class LimitedUsersPublishingApprovalSettings : PublishingApprovalSettings
    {
        public override PublishingApprovalSettingsTypes Type
        {
            get
            {
                return PublishingApprovalSettingsTypes.LimitedUsers;
            }
        }

        public List<UserIdentity> Users { get; set; }
    }
}
