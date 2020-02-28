import { Process } from '..';
import { ProcessData } from '../processes';
import { MultilingualString, GuidValue } from '@omnia/fx-models';


export interface ProcessActionModel {
    process: Process;
    processData: { [processStepId: string]: ProcessData };
    deletedProcessId?: GuidValue;
}