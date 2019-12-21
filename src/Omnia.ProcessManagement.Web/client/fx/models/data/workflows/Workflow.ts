import { GuidValue } from '@omnia/fx-models';
import { WorkflowTask } from './WorkflowTask';
import { WorkflowData } from './WorkflowData';
import { WorkflowCompletedType } from '../enums';

export interface Workflow {
    id: GuidValue,
    processId: GuidValue,
    comment: string,
    dueDate: Date,
    completedType: WorkflowCompletedType,
    workflowTasks: Array<WorkflowTask>,
    canCancelByUser: boolean,
    workflowData: WorkflowData
}