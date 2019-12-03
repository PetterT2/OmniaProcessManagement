import { IProcessDesignerItem, TabRegistration, ActionItem, ActionButton, ActionItemType, ActionGroupButtons } from '../../models/processdesigner';

/**
 * Rules to check object typeings
 * */
export const TabManager = {
    addLoadingToButton(editorItem: IProcessDesignerItem, id: string)
    {
        TabManager.changeActionButtonsState(editorItem.tabs, true, id);
    },
    removeLoadingFromButton(editorItem: IProcessDesignerItem, id: string)
    {
        TabManager.changeActionButtonsState(editorItem.tabs, false, id);
    },
    addDisabledToButton(editorItem: IProcessDesignerItem, id: string) {
        TabManager.changeActionButtonsState(editorItem.tabs, false, id, true);
    },
    removeDisabledFromButton(editorItem: IProcessDesignerItem, id: string) {
        TabManager.changeActionButtonsState(editorItem.tabs, false, id);
    },
    changeActionButtonsState(editorTabs: TabRegistration[], loading: boolean, id: string, disabled: boolean = false)
    {
        editorTabs.forEach((tab) =>
        {
            TabManager.changeActionButtonState(tab.actionToolbar.checkedOutButtons, loading, disabled, id);
            TabManager.changeActionButtonState(tab.actionToolbar.editorDisplayActionButtons, loading, disabled, id);
            TabManager.changeActionButtonState(tab.actionToolbar.notCheckedOutActionButtons, loading, disabled, id);
        });
    },

    changeActionButtonState(buttons: ActionItem[], loading: boolean, disabled: boolean, id: string)
    {
        let button = buttons.find(b => b.id === id);
        if (button)
        {
            (<ActionButton>button).loading = loading;
            (<ActionButton>button).disabled = disabled;
        }
        let buttonGroups = buttons.filter(b => b.type == ActionItemType.GroupButtons,);
        if (buttonGroups) {
            buttonGroups.forEach((group: ActionGroupButtons) => {
                let button = group.buttons.find(b => b.id === id);
                if (button) {
                    (<ActionButton>button).loading = loading;
                    (<ActionButton>button).disabled = disabled;
                }
            });
        }
    }
}
