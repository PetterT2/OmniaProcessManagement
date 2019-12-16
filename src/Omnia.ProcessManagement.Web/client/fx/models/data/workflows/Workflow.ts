import { GuidValue } from '@omnia/fx-models';
import { Enums } from '../../Enums';
import { WorkflowTask } from './WorkflowTask';
import { WorkflowData } from './WorkflowData';

export interface Workflow {
    id: GuidValue,
    processId: GuidValue,
    comment: string,
    dueDate: Date,
    completedType: Enums.WorkflowEnums.WorkflowCompletedType,
    workflowTasks: Array<WorkflowTask>,
    canCancelByUser: boolean,
    workflowData: WorkflowData
}