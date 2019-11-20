import { GuidValue, LanguageTag, MultilingualString } from '@omnia/fx-models';

export interface ProcessStep {
    title: MultilingualString;
    id: GuidValue;
    processDataHash: string;

    processSteps: Array<ProcessStep>;
}