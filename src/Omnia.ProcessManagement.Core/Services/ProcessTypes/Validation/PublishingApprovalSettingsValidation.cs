using Omnia.Fx.Models.EnterprisePropertySets;
using Omnia.Fx.Models.Extensions;
using Omnia.ProcessManagement.Models.ProcessTypes.PublishingApprovalSettings;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Omnia.ProcessManagement.Core.Services.ProcessTypes.Validation
{
    internal class PublishingApprovalSettingsValidation
    {
        internal static PublishingApprovalSettings Validate(PublishingApprovalSettings settings, EnterprisePropertySet set)
        {
            if (settings.Type == PublishingApprovalSettingsTypes.PersonProperty)
            {
                var personPropertyPublishingApprovalSettings = CleanModel<PersonPropertyPublishingApprovalSettings>(settings);
                settings = personPropertyPublishingApprovalSettings;
                var personPropertyId = personPropertyPublishingApprovalSettings.PersonEnterprisePropertyDefinitionId;

                if (personPropertyId == Guid.Empty ||
                    !set.Settings.Items.Any(i => i.EnterprisePropertyDefinitionId == personPropertyId && i.Type == Fx.Models.EnterpriseProperties.PropertyIndexedType.Person))
                {
                    throw new Exception("PersonPropertyPublishingApprovalSettings.PersonEnterprisePropertyDefinitionId in is invalid");
                }
            }
            else if (settings.Type == PublishingApprovalSettingsTypes.TermDriven)
            {
                var termDrivenPublishingApprovalSettings = CleanModel<TermDrivenPublishingApprovalSettings>(settings);
                settings = termDrivenPublishingApprovalSettings;
                var taxonomyPropertyId = termDrivenPublishingApprovalSettings.TaxonomyEnterprisePropertyDefinitionId;

                if (taxonomyPropertyId == Guid.Empty ||
                    !set.Settings.Items.Any(i => i.EnterprisePropertyDefinitionId == taxonomyPropertyId && i.Type == Fx.Models.EnterpriseProperties.PropertyIndexedType.Taxonomy))
                {
                    throw new Exception("TermDrivenPublishingApprovalSettings.TaxonomyEnterprisePropertyDefinitionId is invalid");
                }
            }
            else if (settings.Type == PublishingApprovalSettingsTypes.LimitedUsers)
            {
                var limitedUsersPublishingApprovalSettings = CleanModel<LimitedUsersPublishingApprovalSettings>(settings);
                settings = limitedUsersPublishingApprovalSettings;
                if (limitedUsersPublishingApprovalSettings.Users == null || limitedUsersPublishingApprovalSettings.Users.Count == 0)
                {
                    throw new Exception("LimitedUsersPublishingApprovalSettings.Users is invalid");
                }
            }
            else if (settings.Type == PublishingApprovalSettingsTypes.Anyone)
            {
                settings = CleanModel<AnyonePublishingApprovalSettings>(settings);
            }

            return settings;
        }

        private static T CleanModel<T>(PublishingApprovalSettings settings) where T : PublishingApprovalSettings, new()
        {
            var publishingSettings = settings.Cast<PublishingApprovalSettings, T>();
            if (publishingSettings.AdditionalProperties != null)
            {
                publishingSettings.AdditionalProperties.Clear();
            }
            return publishingSettings;
        }
    }
}
