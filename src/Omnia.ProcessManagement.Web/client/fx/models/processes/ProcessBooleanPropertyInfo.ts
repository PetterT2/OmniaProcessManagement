import { GuidValue, PropertyIndexedType } from '@omnia/fx-models';
import { ProcessPropertyInfo } from './ProcessPropertyInfo';

export interface ProcessBooleanPropertyInfo extends ProcessPropertyInfo {
    type: PropertyIndexedType.Boolean;
    value: boolean;
}