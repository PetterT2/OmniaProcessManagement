import { DisplayModes, TabRegistration } from '.';

export interface IProcessDesignerItem {
    settings: {
        defaultDisplayMode: DisplayModes
    },
    tabs: Array<TabRegistration>,
    title: string,
    onActivation();
    onSaveAsDraft<ItemType>(): Promise<ItemType>;
    onDiscardChanges<ItemType>(): Promise<ItemType>;
    onClose<ItemType>(): Promise<ItemType>;
    //onCheckOut<ItemType>(): Promise<ItemType>;
}