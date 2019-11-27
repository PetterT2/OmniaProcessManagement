import { ProcessStep } from '../data';
import { NodeState } from '.';

export interface ProcessStepNavigationNode extends ProcessStep {
    nodeState?: NodeState;
}