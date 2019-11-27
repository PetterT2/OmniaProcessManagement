import { GuidValue, MultilingualString } from '@omnia/fx-models';
import { ProcessTypeSettings } from './ProcessTypeSettings';

export interface ProcessType {
    /**
     * This is also term id or term set id
     * */
    id: GuidValue;
    rootId: GuidValue;
    title: MultilingualString;
    settings: ProcessTypeSettings;
    readonly secondaryOrderNumber: number; //This is for secondary-order purpose

    //client-side
    multilingualTitle: string;
}