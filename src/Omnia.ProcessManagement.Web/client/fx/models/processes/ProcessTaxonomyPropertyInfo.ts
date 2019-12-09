import { GuidValue, PropertyIndexedType } from '@omnia/fx-models';
import { ProcessPropertyInfo } from './ProcessPropertyInfo';

export interface ProcessTaxonomyPropertyInfo extends ProcessPropertyInfo {
    type: PropertyIndexedType.Taxonomy;
    multiple: boolean;
    termSetId: GuidValue;
    termIds: Array<GuidValue>;

    //client-side
    parentInternalName?: string;
    limitLevel?: number;
}