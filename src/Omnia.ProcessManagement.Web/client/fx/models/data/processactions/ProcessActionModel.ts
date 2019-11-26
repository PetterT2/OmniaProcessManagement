import { Process } from '..';
import { ProcessData } from '../processes';


export interface ProcessActionModel {
    webUrl?: string;
    process: Process;
    processData: { [processStepId: string]: ProcessData };
}