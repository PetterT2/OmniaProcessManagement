import { GuidValue, PropertyIndexedType } from '@omnia/fx-models';
import { ProcessPropertyInfo } from './ProcessPropertyInfo';

export interface ProcessNumberPropertyInfo extends ProcessPropertyInfo{
    type: PropertyIndexedType.Number;
    value: number;
}