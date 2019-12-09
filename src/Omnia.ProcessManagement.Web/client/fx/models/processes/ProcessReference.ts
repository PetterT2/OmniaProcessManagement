import { GuidValue } from '@omnia/fx-models';

export interface ProcessReference {
    processId: GuidValue;
    processStepId: GuidValue;
    opmProcessId: GuidValue;
}