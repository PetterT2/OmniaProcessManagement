export class PagingServerQuery  {
    public page: number = 0;
    public rowsPerPage: number = 30;
    public itemCount: number = 0;
    public isLoading: boolean = true;
    public hasPaging: boolean = false;
    public hasNextPage: boolean = true;
    public loadPreviousPage: Function;
    public loadNextPage: Function;
    public pagingInfo = "";

    constructor(rowsPerPage: number) {
        this.rowsPerPage = rowsPerPage;
    }

    public resetPage() {
        this.page = 0;
        this.pagingInfo = "";
    }

    public nextPage = () => {
        if (this.isLastPage()) {
            return;
        }
        this.page++;
        if (this.loadNextPage)
            this.loadNextPage();
    }

    public previousPage = () => {
        if (this.isFirstPage()) {
            return;
        }
        this.page--;
        if (this.loadPreviousPage)
            this.loadPreviousPage();
    }

    public isFirstPage = () => {
        return this.page == 0;
    }

    public isLastPage = () => {
        return !this.hasNextPage;
    }

    public isShowPager = () => {
        return this.hasPaging;
    }
}
