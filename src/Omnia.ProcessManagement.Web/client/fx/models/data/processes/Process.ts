import { GuidValue } from '@omnia/fx-models';
import { RootProcessItem } from './RootProcessItem';

export interface Process {
    id: GuidValue;
    opmProcessId: GuidValue;
    rootProcessItem: RootProcessItem;
    checkedOutBy: string
}