import { Process } from '..';
import { ProcessData } from '../processes';
import { MultilingualString } from '@omnia/fx-models';


export interface ProcessActionModel {
    processStepTitle?: MultilingualString;
    process: Process;
    processData: { [processStepId: string]: ProcessData };
}