import { GuidValue, PropertyIndexedType } from '@omnia/fx-models';
import { ProcessPropertyInfo } from './ProcessPropertyInfo';

export interface ProcessDatetimePropertyInfo extends ProcessPropertyInfo {
    type: PropertyIndexedType.DateTime;
    value: Date;
    isDateOnly: boolean;
}