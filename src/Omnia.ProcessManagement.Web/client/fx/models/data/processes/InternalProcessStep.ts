import { ProcessStepType } from '../enums';
import { ProcessStep } from './ProcessStep';

export interface InternalProcessStep extends ProcessStep {
    type: ProcessStepType.Internal;

    processDataHash: string;
    processSteps: Array<ProcessStep>;
}