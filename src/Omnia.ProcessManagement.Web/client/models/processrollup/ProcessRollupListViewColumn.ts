import { PropertyIndexedType } from '@omnia/fx-models';

export interface ProcessRollupListViewColumn {
    internalName: string,
    type: PropertyIndexedType;
    width?: string
    showHeading?: boolean;
}