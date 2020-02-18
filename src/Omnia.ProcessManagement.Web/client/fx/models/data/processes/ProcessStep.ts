import { GuidValue, MultilingualString } from '@omnia/fx-models';
import { ProcessStepType } from '../enums';

export interface ProcessStep {
    id: GuidValue;
    title: MultilingualString;
    type: ProcessStepType;

    //client-side
    multilingualTitle?: string
}