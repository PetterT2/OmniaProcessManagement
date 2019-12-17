import { Process } from '../../fx/models';

export interface DisplayProcess extends Process {
    sortValues: { [key: string]: string };
    isMouseOver?: boolean;
}