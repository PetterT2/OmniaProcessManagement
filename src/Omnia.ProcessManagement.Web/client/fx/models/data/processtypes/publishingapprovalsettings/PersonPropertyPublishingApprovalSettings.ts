import { PublishingApprovalSettings, PublishingApprovalSettingsTypes } from '.';
import {  GuidValue } from '@omnia/fx-models';

export interface PersonPropertyPublishingApprovalSettings extends PublishingApprovalSettings {
    type: PublishingApprovalSettingsTypes.PersonProperty;
    personEnterprisePropertyDefinitionId: GuidValue;
}