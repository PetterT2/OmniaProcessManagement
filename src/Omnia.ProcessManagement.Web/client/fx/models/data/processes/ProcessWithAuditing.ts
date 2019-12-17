import { Process } from './Process';

export interface ProcessWithAuditing extends Process {
    createdBy: string;
    modifiedBy: string;
    createAt: Date;
    modifiedAt: Date;
}