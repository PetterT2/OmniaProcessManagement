import { GuidValue } from '@omnia/fx-models';
import { Process, ProcessStep, ProcessData } from '..';

export interface ProcessReferenceData {
    readonly process: Process;

    //If null => root process step
    readonly parentProcessStep?: ProcessStep;

    readonly currentProcessStep: ProcessStep;
    readonly currentProcessData: ProcessData;
}