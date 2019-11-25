import { PropertySetItemSettings } from '.';
import { UserIdentity, PropertyIndexedType } from '@omnia/fx-models';

export interface PropertySetPersonItemSettings extends PropertySetItemSettings {
    type: PropertyIndexedType.Person;
    fixedDefaultValues: Array<UserIdentity>;
}