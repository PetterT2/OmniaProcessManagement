import { Process } from '../../fx/models';

export interface DraftProcess extends Process {
    sortValues: { [key: string]: string };
    isMouseOver?: boolean;
}