import { RollupProcess } from '.';

export interface RollupProcessResult {
    total: number;
    items: Array<RollupProcess>;
}