import { PublishingApprovalSettings, PublishingApprovalSettingsTypes } from '.';

export interface AnyonePublishingApprovalSettings extends PublishingApprovalSettings {
    type: PublishingApprovalSettingsTypes.Anyone;
}