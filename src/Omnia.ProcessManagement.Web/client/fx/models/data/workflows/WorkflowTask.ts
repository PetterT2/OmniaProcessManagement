import { GuidValue } from '@omnia/fx-models';
import { Enums } from '../../Enums';
import { Process } from '../processes';
import { Workflow } from './Workflow';

export interface WorkflowTask {
    id: GuidValue,
    workflowId: GuidValue,
    comment: string,
    isCompleted: boolean,
    assignedUser: string,
    spTaskId: number,
    taskOutCome: Enums.WorkflowEnums.TaskOutcome,
    createdAt: string,
    createdBy: string,
    workflow: Workflow
}