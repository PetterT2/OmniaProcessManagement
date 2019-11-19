import { Process } from '..';
import { ProcessData } from '../processes';


export interface ProcessActionModel {
    process: Process;
    processData: { [processStepId: string]: ProcessData };
}