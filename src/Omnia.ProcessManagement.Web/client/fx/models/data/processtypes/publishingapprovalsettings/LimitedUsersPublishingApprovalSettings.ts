import { PublishingApprovalSettings, PublishingApprovalSettingsTypes } from '.';
import { UserIdentity } from '@omnia/fx-models';

export interface LimitedUsersPublishingApprovalSettings extends PublishingApprovalSettings {
    type: PublishingApprovalSettingsTypes.LimitedUsers;
    users: Array<UserIdentity>;
}