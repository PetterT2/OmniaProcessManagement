export interface IPagingServerQuery {
    page: number;
    rowsPerPage: number;
    itemCount: number;
    isLoading: boolean;
    hasPaging: boolean;
    hasNextPage: boolean;
    pagingInfo: string;

    loadPreviousPage: Function;
    loadNextPage: Function;
    nextPage: Function;
    previousPage: Function;
    isFirstPage: Function;
    isLastPage: Function;
    isShowPager: Function;
    resetPage: Function;
}
