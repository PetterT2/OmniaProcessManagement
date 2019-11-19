import { GuidValue } from '@omnia/fx-models';
import { RootProcessStep } from './RootProcessStep';

export interface Process {
    id: GuidValue;
    opmProcessId: GuidValue;
    rootProcessStep: RootProcessStep;
    checkedOutBy: string
}