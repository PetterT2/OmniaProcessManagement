import { ProcessStepType } from '../enums';
import { ProcessStep } from './ProcessStep';
import { GuidValue } from '@omnia/fx-models';

export interface ExternalProcessStep extends ProcessStep {
    type: ProcessStepType.External;

    rootProcessStepId: GuidValue;

    //client-side.
    //Use for shape that link to external-process
    basedProcessStepId?: GuidValue;
}