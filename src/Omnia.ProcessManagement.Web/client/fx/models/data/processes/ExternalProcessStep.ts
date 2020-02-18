import { ProcessStepType } from '../enums';
import { ProcessStep } from './ProcessStep';
import { GuidValue } from '@omnia/fx-models';

export interface ExternalProcessStep extends ProcessStep {
    type: ProcessStepType.External;

    opmProcessId: GuidValue;
}