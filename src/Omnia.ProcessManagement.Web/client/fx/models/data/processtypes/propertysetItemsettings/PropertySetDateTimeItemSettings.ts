import { PropertySetItemSettings } from '.';
import { PropertyIndexedType } from '@omnia/fx-models';

export interface PropertySetDateTimeItemSettings extends PropertySetItemSettings {
    type: PropertyIndexedType.DateTime;
    fixedDefaultValue: Date;
}