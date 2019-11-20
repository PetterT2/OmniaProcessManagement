import { GuidValue } from '@omnia/fx-models';
import { Process, ProcessStep, ProcessData } from '../../fx/models';

export interface ProcessReferenceData {
    process: Process;

    isRootProcessStep: boolean;
    currentProcessStep: ProcessStep;
    currentProcessData: ProcessData;
}