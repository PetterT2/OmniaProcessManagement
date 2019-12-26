import { Enums } from '../..';

export interface TaskRequest {
    spItemId: number;
    viewMode: Enums.TaskViewType;
    currentPage?: number;
    queryText: string;
    webUrl: string;
    pagingInfo: string;
    rowPerPage: number;
    sortBy: string;
    sortAsc: boolean;
}