import { Process } from '..';

export interface RollupProcess {
    process: Process;
    properties: { [key: string]: any }
}