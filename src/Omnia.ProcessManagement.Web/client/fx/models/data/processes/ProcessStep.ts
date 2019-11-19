import { GuidValue, LanguageTag, MultilingualString } from '@omnia/fx-models';

export interface ProcessStep {
    title: MultilingualString;
    id: GuidValue;

    processSteps: Array<ProcessStep>;
}