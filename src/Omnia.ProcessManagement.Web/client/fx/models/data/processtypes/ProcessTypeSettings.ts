import { GuidValue } from '@omnia/fx-models';
import { ProcessType } from './ProcessType';
import { ProcessTypeItemSettings } from './ProcessTypeItemSettings';

export interface ProcessTypeSettings {
    termSetId: GuidValue;
}

/**
 * NOTE: whenever an new property is added in settings, we need to define its initial value in factory
 * To ensure it fully react on view
 * */
export const ProcessTypeFactory = {
    createDefaultProcessTypeItem(parentId: GuidValue, termSetId: GuidValue): ProcessType {
        let processType: ProcessType = {
            id: null,
            title: {
                isMultilingualString: true
            },
            multilingualTitle: '',
            secondaryOrderNumber: 0,
            settings: <ProcessTypeItemSettings>{
                allowAppendices: false,
                allowBypassApprovalForRevisions: false,
                allowRevisions: false,
                archive: null,
                reviewReminder: null,
                feedbackRecipientsPropertyDefinitionIds: [],
                enterprisePropertySetId: null,
                propertySetItemSettings: {},
                publishingApprovalSettings: null,
                termSetId: termSetId,
                defaultProcessTemplateId: null,
                processTemplateIds: [],
            }
        }

        return processType;
    }
}