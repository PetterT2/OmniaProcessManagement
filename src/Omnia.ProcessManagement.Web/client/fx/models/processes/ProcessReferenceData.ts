import { GuidValue } from '@omnia/fx-models';
import { Process, ProcessStep, ProcessData } from '..';

export interface ProcessReferenceData {
    readonly process: Process;

    //the process step that match to the current route
    readonly current: {
        parentProcessStep?: ProcessStep; //If null - root process step
        processStep: ProcessStep;
        processData: ProcessData;
    }

    //a shortcut to another process step
    readonly shortcut?: {
        parentProcessStep?: ProcessStep; //If null - root process step
        processStep: ProcessStep;
        processData: ProcessData;
    }
}