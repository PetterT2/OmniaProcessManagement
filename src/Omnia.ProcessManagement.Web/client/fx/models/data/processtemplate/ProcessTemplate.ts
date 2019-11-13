import { GuidValue, MultilingualString } from '@omnia/fx-models';

export interface ProcessTemplate {
    id: GuidValue;
    title: MultilingualString;
    settings: any;

    //Client-side
    multilingualTitle: string;
}

/**
 * NOTE: whenever an new property is added in settings, we need to define its initial value in factory
 * To ensure it fully react on view
 * */
export const ProcessTemplateFactory = {
    createDefaultProcessTemplate(): ProcessTemplate {
        let documentTemplate: ProcessTemplate = {
            title: {
                "en-us": ""
            },
            multilingualTitle: '',
            settings: {}
        } as ProcessTemplate

        return documentTemplate;
    }
}