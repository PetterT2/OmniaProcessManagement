import { DraftProcess } from './DraftProcess';

export interface FilterAndSortResponse {
    total: number,
    processes: Array<DraftProcess>
}
