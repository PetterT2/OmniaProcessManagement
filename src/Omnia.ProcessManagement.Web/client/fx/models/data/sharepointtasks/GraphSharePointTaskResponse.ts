import { SharePointTask } from './SharePointTask';

export interface GraphSharePointTaskResponse {
    nextLinkUrl?: string;
    tasks: Array<SharePointTask>;
}