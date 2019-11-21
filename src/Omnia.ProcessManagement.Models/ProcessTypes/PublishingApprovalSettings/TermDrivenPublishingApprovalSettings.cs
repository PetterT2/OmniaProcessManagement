using Omnia.Fx.Models.Users;
using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.ProcessTypes.PublishingApprovalSettings
{
    public class TermDrivenPublishingApprovalSettings : PublishingApprovalSettings
    {
        public override PublishingApprovalSettingsTypes Type
        {
            get
            {
                return PublishingApprovalSettingsTypes.TermDriven;
            }
        }

        public Guid TaxonomyEnterprisePropertyDefinitionId { get; set; }
        public Dictionary<Guid, List<UserIdentity>> Settings { get; set; }
    }
}
