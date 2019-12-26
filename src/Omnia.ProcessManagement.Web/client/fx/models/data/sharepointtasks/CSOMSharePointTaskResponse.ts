import { SharePointTask } from './SharePointTask';

export interface CSOMSharePointTaskResponse {
    nextPageString: string;
    previousPageString: string;
    tasks: Array<SharePointTask>;
}