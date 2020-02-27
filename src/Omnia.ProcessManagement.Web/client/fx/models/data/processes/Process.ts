import { GuidValue } from '@omnia/fx-models';
import { RootProcessStep } from './RootProcessStep';
import { ProcessVersionType, ProcessWorkingStatus } from '..';

export interface Process {
    id: GuidValue;
    opmProcessId: GuidValue;
    rootProcessStep: RootProcessStep;
    versionType: ProcessVersionType;
    teamAppId: GuidValue;
    webId: GuidValue;
    processWorkingStatus: ProcessWorkingStatus;
    checkedOutBy?: string;
    createdBy: string;
    modifiedBy: string;
    createAt: Date;
    modifiedAt: Date;
    publishedAt?: Date;
    publishedBy?: string;

    //client-side
    modifiedByName?: string;
    checkedOutByName?: string;
}