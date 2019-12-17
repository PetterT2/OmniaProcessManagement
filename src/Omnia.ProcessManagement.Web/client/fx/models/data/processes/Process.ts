import { GuidValue } from '@omnia/fx-models';
import { RootProcessStep } from './RootProcessStep';
import { ProcessVersionType } from '..';
import { Enums } from '../../Enums';

export interface Process {
    id: GuidValue;
    opmProcessId: GuidValue;
    rootProcessStep: RootProcessStep;
    checkedOutBy: string;
    versionType: ProcessVersionType;
    teamAppId: GuidValue;
    webId: GuidValue;
    processWorkingStatus: Enums.WorkflowEnums.ProcessWorkingStatus;
    createdBy: string;
    modifiedBy: string;
    createAt: Date;
    modifiedAt: Date;
    //client-side
    readonly isCheckedOutByCurrentUser: boolean;
}