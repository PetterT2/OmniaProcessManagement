using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.ProcessTypes.PublishingApprovalSettings
{
    public class AnyonePublishingApprovalSettings : PublishingApprovalSettings
    {
        public override PublishingApprovalSettingsTypes Type
        {
            get
            {
                return PublishingApprovalSettingsTypes.Anyone;
            }
        }
    }
}
