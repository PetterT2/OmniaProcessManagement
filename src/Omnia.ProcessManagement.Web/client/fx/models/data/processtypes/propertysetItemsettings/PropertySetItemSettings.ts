import { PropertyIndexedType, GuidValue } from '@omnia/fx-models';

export interface PropertySetItemSettings {
    /**
     * Note: there are three types Data, Media, EnterpriseKeyworkds are not supported, it will throw exception in validation
     * */
    type: PropertyIndexedType;

    /**
     * Alternative enterprise property definition internal name with lower priority when process token
     * */
    alternativeInternalName: string;

    defaultValueFromAppPropertyDefinitionId?: GuidValue;
}