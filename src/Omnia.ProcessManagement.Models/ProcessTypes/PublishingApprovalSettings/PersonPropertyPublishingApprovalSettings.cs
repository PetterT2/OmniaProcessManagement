using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.ProcessTypes.PublishingApprovalSettings
{
    public class PersonPropertyPublishingApprovalSettings : PublishingApprovalSettings
    {
        public override PublishingApprovalSettingsTypes Type
        {
            get
            {
                return PublishingApprovalSettingsTypes.PersonProperty;
            }
        }

        public Guid PersonEnterprisePropertyDefinitionId { get; set; }
    }
}
