import { LimitedUsersPublishingApprovalSettings } from '.';
import { PersonPropertyPublishingApprovalSettings } from './PersonPropertyPublishingApprovalSettings';
import { TermDrivenPublishingApprovalSettings } from './TermDrivenPublishingApprovalSettings';
import { GroupPublishingApprovalSettings } from './GroupPublishingApprovalSettings';

export enum PublishingApprovalSettingsTypes {
    Anyone = 0,
    LimitedUsers = 1,
    TermDriven = 2,
    PersonProperty = 3
}

export interface PublishingApprovalSettings {
    type: PublishingApprovalSettingsTypes;
}

/**
 * NOTE: whenever an new property is added in settings, we need to define its initial value in factory
 * To ensure it fully react on view
 * */
export const PublishingApprovalSettingsFactory = {
    createDefault(type: PublishingApprovalSettingsTypes): PublishingApprovalSettings {
        let settings: PublishingApprovalSettings = null
        switch (type) {
            case PublishingApprovalSettingsTypes.Anyone:
                settings = {
                    type: PublishingApprovalSettingsTypes.Anyone
                }
                break;
            case PublishingApprovalSettingsTypes.LimitedUsers:
                settings = {
                    type: PublishingApprovalSettingsTypes.LimitedUsers,
                    users: []
                } as LimitedUsersPublishingApprovalSettings
                break;
            case PublishingApprovalSettingsTypes.TermDriven:
                settings = {
                    type: PublishingApprovalSettingsTypes.TermDriven,
                    taxonomyEnterprisePropertyDefinitionId: null,
                    settings: {}
                } as TermDrivenPublishingApprovalSettings
                break;
            case PublishingApprovalSettingsTypes.PersonProperty:
                settings = {
                    type: PublishingApprovalSettingsTypes.PersonProperty,
                    personEnterprisePropertyDefinitionId: null
                } as PersonPropertyPublishingApprovalSettings
                break;
        }


        return settings;
    }
}