import { Guid, IMessageBusSubscriptionHandler, StateMutation } from '@omnia/fx-models';
import { ProcessStepDesignerItemBase } from './ProcessStepDesignerItemBase';
import { IProcessDesignerItem, DisplayModes, ActionButton, TabRegistration } from '../../models/processdesigner';
import { ActionButtonFactory } from '../factory/ActionButtonFactory';
import { ProcessStepDrawingTabRenderer } from '../processstepcomponents/processdrawing';
import { OPMCoreLocalization } from '../../core/loc/localize';
import { Localize } from '@omnia/fx';
import { ProcessContentTabRenderer } from '../processstepcomponents/content';
import { ProcessDocumentsTabRenderer } from '../processstepcomponents/documents';
import { ProcessLinksTabRenderer } from '../processstepcomponents/links';
import { ProcessTasksTabRenderer } from '../processstepcomponents/tasks';

export class ProcessStepDesignerItem extends ProcessStepDesignerItemBase implements IProcessDesignerItem {
    @Localize(OPMCoreLocalization.namespace) opmCoreLoc: OPMCoreLocalization.locInterface;
    onActivation() {
        
    }
    title: string;

    public settings = {
        defaultDisplayMode: DisplayModes.contentEditing,
    };   

    protected drawingTab: TabRegistration = {
        tabId: "9bf78a25-3082-4333-80d1-55484a28efc0",
        tabRenderer: new ProcessStepDrawingTabRenderer(),
        tabName: this.opmCoreLoc.Process.Drawing,
        active: true,
        actionToolbar: {
            editorDisplayActionButtons: ActionButtonFactory.createDisplaySettingsButtons(),
            checkedOutButtons: ActionButtonFactory.createDefaultCheckoutedButtons(this),
            notCheckedOutActionButtons: ActionButtonFactory.createDefaultNotCheckoutedButtons(this),
        }
    };

    protected contentTab: TabRegistration = {
        tabId: "836930a7-649f-43d7-8d17-e52ca665ab44",
        tabRenderer: new ProcessContentTabRenderer(),
        tabName: this.opmCoreLoc.Process.Content,
        active: false,
        actionToolbar: {
            editorDisplayActionButtons: ActionButtonFactory.createDisplaySettingsButtons(),
            checkedOutButtons: ActionButtonFactory.createDefaultCheckoutedButtons(this),
            notCheckedOutActionButtons: ActionButtonFactory.createDefaultNotCheckoutedButtons(this),
        }
    };
    protected documentsTab: TabRegistration = {
        tabId: "d6b6b4c7-b307-44ff-b600-4e5b547814c9",
        tabRenderer: new ProcessDocumentsTabRenderer(),
        tabName: this.opmCoreLoc.Process.Documents,
        active: false,
        actionToolbar: {
            editorDisplayActionButtons: ActionButtonFactory.createDisplaySettingsButtons(),
            checkedOutButtons: ActionButtonFactory.createDefaultCheckoutedButtons(this),
            notCheckedOutActionButtons: ActionButtonFactory.createDefaultNotCheckoutedButtons(this),
        }
    };
    protected linksTab: TabRegistration = {
        tabId: "eb86d6e0-7f50-4d67-84cf-a32c91bc7b6e",
        tabRenderer: new ProcessLinksTabRenderer(),
        tabName: this.opmCoreLoc.Process.Links,
        active: false,
        actionToolbar: {
            editorDisplayActionButtons: ActionButtonFactory.createDisplaySettingsButtons(),
            checkedOutButtons: ActionButtonFactory.createDefaultCheckoutedButtons(this),
            notCheckedOutActionButtons: ActionButtonFactory.createDefaultNotCheckoutedButtons(this),
        }
    };
    protected tasksTab: TabRegistration = {
        tabId: "7627d1de-e49d-4a62-ab79-4b216fade62b",
        tabRenderer: new ProcessTasksTabRenderer(),
        tabName: this.opmCoreLoc.Process.Tasks,
        active: false,
        actionToolbar: {
            editorDisplayActionButtons: ActionButtonFactory.createDisplaySettingsButtons(),
            checkedOutButtons: ActionButtonFactory.createDefaultCheckoutedButtons(this),
            notCheckedOutActionButtons: ActionButtonFactory.createDefaultNotCheckoutedButtons(this),
        }
    };

    tabs: Array<TabRegistration> = [this.drawingTab, this.contentTab, this.documentsTab, this.linksTab, this.tasksTab];

    constructor() {
        super();
    }
}