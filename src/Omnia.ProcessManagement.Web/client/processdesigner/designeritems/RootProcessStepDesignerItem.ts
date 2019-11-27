import { Guid, IMessageBusSubscriptionHandler, StateMutation } from '@omnia/fx-models';
import { ProcessStepDesignerItemBase } from './ProcessStepDesignerItemBase';
import { IProcessDesignerItem, DisplayModes, ActionButton, TabRegistration } from '../../models/processdesigner';
//import { ProcessStepDrawingTabRenderer } from '../panelrenderers';
import { ActionButtonFactory } from '../factory/ActionButtonFactory';
import { ProcessStepDrawingTabRenderer } from '../panelrenderers/processdrawing';
import { ProcessPropertiesTabRenderer } from '../panelrenderers/properties';

export class RootProcessStepDesignerItem extends ProcessStepDesignerItemBase implements IProcessDesignerItem {
    onActivation() {
        
    }
    title: string;

    //@Localize(PublishingAppLocalization.namespace) loc: PublishingAppLocalization.locInterface;

    public settings = {
        defaultDisplayMode: DisplayModes.contentEditing,
    };

    protected drawingTab: TabRegistration = {
        tabId: "9bf78a25-3082-4333-80d1-55484a28efc0",
        tabRenderer: new ProcessStepDrawingTabRenderer(),
        //tabRenderer: null,
        tabName: "Drawing",//this.editorLoc.Editor.Tabs.Content,
        active: true,
        actionToolbar: {
            editorDisplayActionButtons: [],
            checkedOutButtons: ActionButtonFactory.createDefaultCheckoutedButtons(this),
            notCheckedOutActionButtons: ActionButtonFactory.createDefaultNotCheckoutedButtons(this),
        }
    };

    //protected contentTab: TabRegistration = {
    //    tabId: "836930a7-649f-43d7-8d17-e52ca665ab44",
    //    tabRenderer: new LayoutEditorTabRenderer(),
    //    tabName: "Content",//this.editorLoc.Editor.Tabs.Content,
    //    active: false,
    //    actionToolbar: {
    //        editorDisplayActionButtons: [],
    //        checkedOutButtons: ActionButtonFactory.createDefaultCheckoutedButtons(this),
    //        notCheckedOutActionButtons: ActionButtonFactory.createDefaultNotCheckoutedButtons(this),
    //    }
    //};
    //protected documentsTab: TabRegistration = {
    //    tabId: "d6b6b4c7-b307-44ff-b600-4e5b547814c9",
    //    tabRenderer: new LayoutEditorTabRenderer(),
    //    tabName: "Documents",//this.editorLoc.Editor.Tabs.Content,
    //    active: false,
    //    actionToolbar: {
    //        editorDisplayActionButtons: [],
    //        checkedOutButtons: ActionButtonFactory.createDefaultCheckoutedButtons(this),
    //        notCheckedOutActionButtons: ActionButtonFactory.createDefaultNotCheckoutedButtons(this),
    //    }
    //};
    //protected linksTab: TabRegistration = {
    //    tabId: "eb86d6e0-7f50-4d67-84cf-a32c91bc7b6e",
    //    tabRenderer: new LayoutEditorTabRenderer(),
    //    tabName: "Links",//this.editorLoc.Editor.Tabs.Content,
    //    active: false,
    //    actionToolbar: {
    //        editorDisplayActionButtons: [],
    //        checkedOutButtons: ActionButtonFactory.createDefaultCheckoutedButtons(this),
    //        notCheckedOutActionButtons: ActionButtonFactory.createDefaultNotCheckoutedButtons(this),
    //    }
    //};
    //protected tasksTab: TabRegistration = {
    //    tabId: "7627d1de-e49d-4a62-ab79-4b216fade62b",
    //    tabRenderer: new LayoutEditorTabRenderer(),
    //    tabName: "Tasks",//this.editorLoc.Editor.Tabs.Content,
    //    active: false,
    //    actionToolbar: {
    //        editorDisplayActionButtons: [],
    //        checkedOutButtons: ActionButtonFactory.createDefaultCheckoutedButtons(this),
    //        notCheckedOutActionButtons: ActionButtonFactory.createDefaultNotCheckoutedButtons(this),
    //    }
    //};
    protected propertiesTab: TabRegistration = {
        tabId: "786bdd1a-133f-4d45-9adc-8add66365762",
        tabRenderer: new ProcessPropertiesTabRenderer(),
        tabName: "Properties",
        active: false,
        actionToolbar: {
            editorDisplayActionButtons: [],
            checkedOutButtons: ActionButtonFactory.createDefaultCheckoutedButtons(this),
            notCheckedOutActionButtons: ActionButtonFactory.createDefaultNotCheckoutedButtons(this),
        }
    };

    tabs: Array<TabRegistration> = [this.drawingTab/*, this.contentTab, this.documentsTab, this.linksTab, this.tasksTab*/, this.propertiesTab];

    constructor() {
        super();
    }
}