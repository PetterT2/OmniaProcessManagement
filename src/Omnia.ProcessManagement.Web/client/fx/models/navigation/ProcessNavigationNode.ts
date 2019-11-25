import { NavigationNode } from './NavigationNode';
import { ProcessNavigationData } from './ProcessNavigationData';
import { ProcessStep } from '../data';

export interface ProcessNavigationNode<T extends ProcessNavigationData> extends NavigationNode<T> {
    processStep: ProcessStep;

    /**
     *Relative path
     * */
    path: string;
}