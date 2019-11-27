import { LanguageTag } from '@omnia/fx-models';

export interface ProcessLibraryRequest {
    webUrl: string,
    filters?: { [key: string]: Array<string> },
    sortBy?: string,
    sortAsc?: boolean,
    pageNum: number,
    pageSize: number;
}
