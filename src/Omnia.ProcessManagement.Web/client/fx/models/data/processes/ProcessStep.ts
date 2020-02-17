import { GuidValue, MultilingualString } from '@omnia/fx-models';
import { ProcessStepType } from '../enums';

export interface ProcessStep {
    id: GuidValue;
    processDataHash: string;
    title: MultilingualString;
    processSteps: Array<ProcessStep>;
    type?: ProcessStepType;

    //client-side
    multilingualTitle?: string
}