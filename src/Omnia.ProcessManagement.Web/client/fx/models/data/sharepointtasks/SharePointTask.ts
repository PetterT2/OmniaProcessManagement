import { Enums } from '../..';
import { GuidValue } from '@omnia/fx-models';

export interface SharePointTask {
    id: number,
    title: string,
    startDate?: Date,
    dueDate?: Date,
    assignedTo: string,
    created: Date,
    createdBy: string,
    listId: GuidValue,
    contentType: Enums.TaskContentType,
    status: string,
    percentComplete: number,
    predecessorsId: Array<number>,
    comment: string,
    isCurrentResponsible: boolean,
    description: string,
    webUrl: string
}

