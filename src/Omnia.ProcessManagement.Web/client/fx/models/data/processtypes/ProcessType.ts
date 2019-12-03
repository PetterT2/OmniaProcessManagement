import { GuidValue, MultilingualString } from '@omnia/fx-models';
import { ProcessTypeSettings } from './ProcessTypeSettings';

export interface ProcessType {
    /**
     * This is also term id or term set id
     * */
    id: GuidValue;
    parentId?: GuidValue;
    title: MultilingualString;
    settings: ProcessTypeSettings;
    readonly childCount: number; 
    readonly secondaryOrderNumber: number; //This is for secondary-order purpose

    //client-side
    multilingualTitle: string;
}