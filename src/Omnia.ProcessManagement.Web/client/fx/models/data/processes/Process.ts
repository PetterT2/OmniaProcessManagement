import { GuidValue } from '@omnia/fx-models';
import { RootProcessStep } from './RootProcessStep';
import { ProcessVersionType, ProcessWorkingStatus } from '..';

export interface Process {
    id: GuidValue;
    opmProcessId: GuidValue;
    rootProcessStep: RootProcessStep;
    checkedOutBy: string;
    versionType: ProcessVersionType;
    teamAppId: GuidValue;
    webId: GuidValue;
    processWorkingStatus: ProcessWorkingStatus;
    createdBy: string;
    modifiedBy: string;
    createAt: Date;
    modifiedAt: Date;
    //client-side
    readonly isCheckedOutByCurrentUser: boolean;
}