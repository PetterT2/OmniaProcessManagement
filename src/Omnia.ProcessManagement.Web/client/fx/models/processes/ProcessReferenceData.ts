import { GuidValue } from '@omnia/fx-models';
import { Process, ProcessStep, ProcessData } from '..';

export interface ProcessReferenceData {
    readonly process: Process;

    readonly isRootProcessStep: boolean;
    readonly currentProcessStep: ProcessStep;
    readonly currentProcessData: ProcessData;
}