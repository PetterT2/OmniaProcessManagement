import { ProcessRollupListViewColumn } from '.';
import { ProcessRollupViewSettings } from '../../fx/models';

export interface ProcessRollupListViewSettings extends ProcessRollupViewSettings {
    columns: Array<ProcessRollupListViewColumn>
}