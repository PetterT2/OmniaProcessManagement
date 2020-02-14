import { ActionItem } from './ActionButton';
import { DisplayActionButton } from './DisplayActionButton';
import { ITabRenderer } from './TabRenderer';

export interface TabRegistration {
    tabId: string;
    tabRenderer: ITabRenderer;
    tabName: string;
    active: boolean;
    actionToolbar?: {
        editorDisplayActionButtons: Array<DisplayActionButton>;
        checkedOutButtons: Array<ActionItem>;
        checkedOutExtendedActionButtons: Array<ActionItem>;
        notCheckedOutActionButtons: Array<ActionItem>;
    }
}