import { GuidValue } from '@omnia/fx-models';
import { MultilingualData } from '..';

export interface ProcessStep extends MultilingualData {
    id: GuidValue;
    processDataHash: string;

    processSteps: Array<ProcessStep>;
}