import { ProcessLibraryStatus } from './ProcessLibraryStatus';

export interface DraftProcessLibraryStatus extends ProcessLibraryStatus {
    checkedOutBy: string;
}