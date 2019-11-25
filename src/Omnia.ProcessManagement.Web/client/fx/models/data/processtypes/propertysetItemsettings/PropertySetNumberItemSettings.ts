import { PropertySetItemSettings } from '.';
import { PropertyIndexedType } from '@omnia/fx-models';

export interface PropertySetNumberItemSettings extends PropertySetItemSettings {
    type: PropertyIndexedType.Number;
    fixedDefaultValue: number;
}