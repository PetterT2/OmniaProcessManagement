import { GuidValue } from '@omnia/fx-models';

export interface FilterAndSortInfo {
    webUrl: string,
    teamAppId: GuidValue,
    filters?: { [key: string]: Array<string> },
    sortBy?: string,
    sortAsc?: boolean,
    pageNum: number
}
