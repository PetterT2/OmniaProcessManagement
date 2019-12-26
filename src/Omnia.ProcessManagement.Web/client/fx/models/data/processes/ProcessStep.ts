import { GuidValue, MultilingualString } from '@omnia/fx-models';

export interface ProcessStep {
    id: GuidValue;
    processDataHash: string;
    title: MultilingualString;
    processSteps: Array<ProcessStep>;

    //client-side
    multilingualTitle?: string
}