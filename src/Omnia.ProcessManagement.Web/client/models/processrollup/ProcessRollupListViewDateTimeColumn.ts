import { ProcessRollupListViewColumn } from '.';
import { PropertyIndexedType } from '@omnia/fx-models';
import { Enums } from '../../fx/models';

export interface ProcessRollupListViewDateTimeColumn extends ProcessRollupListViewColumn {
    type: PropertyIndexedType.DateTime;
    mode: Enums.ProcessViewEnums.DateTimeMode;
    format: string;
}