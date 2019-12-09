import { GuidValue, PropertyIndexedType } from '@omnia/fx-models';
import { ProcessPropertyInfo } from './ProcessPropertyInfo';

export interface ProcessTextPropertyInfo extends ProcessPropertyInfo {
    type: PropertyIndexedType.Text;
    value: string;
}