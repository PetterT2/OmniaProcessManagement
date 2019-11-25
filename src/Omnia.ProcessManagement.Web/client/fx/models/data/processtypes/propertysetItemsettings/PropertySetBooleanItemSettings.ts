import { PropertySetItemSettings } from '.';
import { PropertyIndexedType } from '@omnia/fx-models';

export interface PropertySetBooleanItemSettings extends PropertySetItemSettings {
    type: PropertyIndexedType.Boolean;
    fixedDefaultValue: boolean;
}