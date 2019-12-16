import { Process } from '../processes';
import { WorkflowTask } from './WorkflowTask';
import { User } from '@omnia/fx-models';

export interface WorkflowApprovalTask extends WorkflowTask {
    process: Process,
    responsible: boolean,
    assignedTo: User
}