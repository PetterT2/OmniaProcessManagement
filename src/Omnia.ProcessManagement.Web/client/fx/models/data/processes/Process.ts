import { GuidValue } from '@omnia/fx-models';
import { RootProcessStep } from './RootProcessStep';
import { ProcessVersionType } from '..';

export interface Process {
    id: GuidValue;
    opmProcessId: GuidValue;
    rootProcessStep: RootProcessStep;
    checkedOutBy: string;
    versionType: ProcessVersionType;
}