
export interface FilterAndSortInfo {
    webUrl: string,
    filters?: { [key: string]: Array<string> },
    sortBy?: string,
    sortAsc?: boolean,
    pageNum: number
}
