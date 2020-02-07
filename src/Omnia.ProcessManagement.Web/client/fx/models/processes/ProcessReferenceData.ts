import { GuidValue } from '@omnia/fx-models';
import { Process, ProcessStep, ProcessData } from '..';
import { ProcessSite } from '../../../models';

export interface ProcessReferenceData {
    readonly process: Process;

    //the process step that match to the current route
    readonly current: {
        parentProcessData?: ProcessData; //If null - root process step
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

    readonly processSite: ProcessSite;
}