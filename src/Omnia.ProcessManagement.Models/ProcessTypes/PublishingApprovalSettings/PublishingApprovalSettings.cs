using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.ProcessTypes.PublishingApprovalSettings
{
    public enum PublishingApprovalSettingsTypes
    {
        Anyone = 0,
        LimitedUsers = 1,
        TermDriven = 2,
        PersonProperty = 3
    }

    public class PublishingApprovalSettings : Omnia.Fx.Models.JsonTypes.OmniaJsonBase
    {
        public virtual PublishingApprovalSettingsTypes Type { get; set; }
    }
}
