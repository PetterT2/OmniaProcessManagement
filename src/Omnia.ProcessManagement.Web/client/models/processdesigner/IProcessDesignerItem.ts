import { DisplayModes, TabRegistration } from '.';

export interface IProcessDesignerItem {
    settings: {
        defaultDisplayMode: DisplayModes
    },
    tabs: Array<TabRegistration>,
    title: string,
    onActivation();
    onSave<ItemType>(): Promise<ItemType>;
    onDiscardChanges<ItemType>(): Promise<ItemType>;
    //onCheckOut<ItemType>(): Promise<ItemType>;
}