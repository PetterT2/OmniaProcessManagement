import { TexSearchestPropFilterValue } from '@omnia/fx-models';

export interface ProcessRollupUISearchboxFilterValue extends TexSearchestPropFilterValue {
    properties: Array<string>,
    searchValue: string
}