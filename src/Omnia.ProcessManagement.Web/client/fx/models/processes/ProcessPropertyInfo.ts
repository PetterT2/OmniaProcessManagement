import { GuidValue, PropertyIndexedType } from '@omnia/fx-models';

export interface ProcessPropertyInfo {
    id: GuidValue;
    title: string;
    internalName: string;
    required?: boolean;
    type: PropertyIndexedType;
}