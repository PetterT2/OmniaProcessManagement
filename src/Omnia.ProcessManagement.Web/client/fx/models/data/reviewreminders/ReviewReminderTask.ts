import { Process } from '../processes';
import { SharePointTask } from '../sharepointtasks';

export interface ReviewReminderTask {
    publishedProcess: Process,
    draftExists: boolean,
    sharePointTask: SharePointTask,
    hasAuthorPermission: boolean
}