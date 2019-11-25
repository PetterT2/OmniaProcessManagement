import { PropertySetItemSettings } from '.';
import { PropertyIndexedType } from '@omnia/fx-models';

export interface PropertySetTextItemSettings extends PropertySetItemSettings {
    type: PropertyIndexedType.Text;
    fixedDefaultValue: string;
}