import { DisplayProcess } from './DisplayProcess';

export interface FilterAndSortResponse {
    total: number,
    processes: Array<DisplayProcess>
}
