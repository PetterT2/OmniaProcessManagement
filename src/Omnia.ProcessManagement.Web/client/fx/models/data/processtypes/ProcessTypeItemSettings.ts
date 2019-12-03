import { GuidValue, Guid } from '@omnia/fx-models';
import { ProcessTypeSettings, Archive, ReviewReminder, PublishingApprovalSettings, PropertySetItemSettings, ProcessTypeSettingsTypes } from '.';

export const ApproverId: GuidValue = "4c32092d-21ec-4137-a3ed-50bcbf6b0f78"; //remember do not new Guid here, it will cause issue in v-select, we keep it as plain text here

export interface ProcessTypeItemSettings extends ProcessTypeSettings {
    type: ProcessTypeSettingsTypes.Item;
    enterprisePropertySetId: GuidValue;
    allowRevisions: boolean;
    allowBypassApprovalForRevisions: boolean;
    processTemplateIds: Array<GuidValue>;
    defaultProcessTemplateId?: GuidValue;

    /**
     * There is a spacial value for defining approver : ApproverId - 4c32092d-21ec-4137-a3ed-50bcbf6b0f78
     * */
    feedbackRecipientsPropertyDefinitionIds: Array<GuidValue>;

    /**
     * null means no Review Reminder setup
     * */
    reviewReminder?: ReviewReminder;

    /**
     * null means no Archive setup
     * */
    archive?: Archive;

    /**
     * null means no Approval needed
     * */
    publishingApprovalSettings: PublishingApprovalSettings;

    propertySetItemSettings: { [id: string]: PropertySetItemSettings }
}