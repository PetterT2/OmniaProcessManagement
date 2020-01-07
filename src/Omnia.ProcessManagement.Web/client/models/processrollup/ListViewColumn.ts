import { PropertyIndexedType } from '@omnia/fx-models';

export interface ListViewColumn {
    internalName: string,
    type: PropertyIndexedType;
    width?: string
    showHeading?: boolean;
}