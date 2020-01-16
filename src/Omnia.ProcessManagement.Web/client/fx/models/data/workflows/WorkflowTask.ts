import { GuidValue } from '@omnia/fx-models';
import { Workflow } from './Workflow';
import { TaskOutcome } from '..';
import { SharePointTask } from '../sharepointtasks';

export interface WorkflowTask {
    id: GuidValue,
    workflowId: GuidValue,
    rootProcessId: GuidValue,
    comment: string,
    isCompleted: boolean,
    assignedUser: string,
    spTaskId: number,
    taskOutCome: TaskOutcome,
    createdAt: string,
    createdBy: string,
    workflow: Workflow,
    sharePointTask: SharePointTask;

    //client-side
    assignedUserDisplayName: string,
    createdByUserDisplayName: string,
}