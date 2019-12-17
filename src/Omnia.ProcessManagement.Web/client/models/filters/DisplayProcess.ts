import { ProcessWithAuditing } from '../../fx/models';

export interface DisplayProcess extends ProcessWithAuditing {
    sortValues: { [key: string]: any };
    isMouseOver?: boolean;
}