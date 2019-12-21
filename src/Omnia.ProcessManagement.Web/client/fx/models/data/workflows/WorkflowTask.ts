import { GuidValue } from '@omnia/fx-models';
import { Workflow } from './Workflow';
import { TaskOutcome } from '..';

export interface WorkflowTask {
    id: GuidValue,
    workflowId: GuidValue,
    comment: string,
    isCompleted: boolean,
    assignedUser: string,
    spTaskId: number,
    taskOutCome: TaskOutcome,
    createdAt: string,
    createdBy: string,
    workflow: Workflow
}