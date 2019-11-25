import { PropertySetItemSettings } from '.';
import { PropertyIndexedType } from '@omnia/fx-models';

export interface PropertySetRichTextItemSettings extends PropertySetItemSettings {
    type: PropertyIndexedType.RichText;
    fixedDefaultValue: string;
}