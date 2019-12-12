import { GuidValue } from '@omnia/fx-models';
import { Enums } from '../../Enums';

export interface WorkflowTask {
    id: GuidValue,
    workflowId: GuidValue,
    comment: string,
    isCompleted: boolean,
    assignedUser: string,
    spTaskId: number,
    taskOutCome: Enums.WorkflowEnums.TaskOutcome
}