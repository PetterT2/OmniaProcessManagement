import { GuidValue } from '@omnia/fx-models';
import { ProcessTemplateSettings } from './ProcessTemplateSettings';

export interface ProcessTemplate {
    id: GuidValue;
    settings: ProcessTemplateSettings;

    //client-side
    multilingualTitle: string
}


/**
 * NOTE: whenever an new property is added in settings, we need to define its initial value in factory
 * To ensure it fully react on view
 * */
export const ProcessTemplateFactory = {
    createDefaultProcessTemplate(): ProcessTemplate {
        let processTemplate: ProcessTemplate = {
            settings: {}
        } as ProcessTemplate

        return processTemplate;
    }
}