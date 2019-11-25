import { PublishingApprovalSettings, PublishingApprovalSettingsTypes } from '.';
import { GuidValue, UserIdentity } from '@omnia/fx-models';

export interface TermDrivenPublishingApprovalSettings extends PublishingApprovalSettings {
    type: PublishingApprovalSettingsTypes.TermDriven;

    taxonomyEnterprisePropertyDefinitionId: GuidValue;
    /**
     * key is term/termset id
     * let the dictionary value null to be inherit
     * 
     * */
    settings: { [id: string]: Array<UserIdentity> };
}
