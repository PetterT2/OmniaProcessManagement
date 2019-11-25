import { PropertySetItemSettings } from '.';
import { PropertyIndexedType, GuidValue } from '@omnia/fx-models';

export interface PropertySetTaxonomyItemSettings extends PropertySetItemSettings {
    type: PropertyIndexedType.Taxonomy;
    fixedDefaultValues: Array<GuidValue>;
}