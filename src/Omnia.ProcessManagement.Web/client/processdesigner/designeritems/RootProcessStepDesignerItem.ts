﻿import { Guid, IMessageBusSubscriptionHandler, StateMutation } from '@omnia/fx-models';
import { ProcessStepDesignerItemBase } from './ProcessStepDesignerItemBase';
import { IProcessDesignerItem, DisplayModes, ActionButton, TabRegistration } from '../../models/processdesigner';
//import { ProcessStepDrawingTabRenderer } from '../panelrenderers';
import { ActionButtonFactory } from '../factory/ActionButtonFactory';
import { ProcessStepDrawingTabRenderer } from '../panelrenderers/processdrawing';
import { ProcessPropertiesTabRenderer } from '../panelrenderers/properties';
import { CurrentProcessStore } from '../../fx';
import { ServiceContainer, Localize } from '@omnia/fx';
import { TabManager } from '../panelrenderers';
import { ActionButtonIds } from '../factory/ActionButtonIds';
import { ProcessContentTabRenderer } from '../panelrenderers/content';
import { ProcessDocumentsTabRenderer } from '../panelrenderers/documents';
import { ProcessLinksTabRenderer } from '../panelrenderers/links';
import { ProcessTasksTabRenderer } from '../panelrenderers/tasks';
import { OPMCoreLocalization } from '../../core/loc/localize';

export class RootProcessStepDesignerItem extends ProcessStepDesignerItemBase implements IProcessDesignerItem {
    @Localize(OPMCoreLocalization.namespace) opmCoreLoc: OPMCoreLocalization.locInterface;
    onActivation() {
        
    }

    public onCheckOut() {
        //todo
        return new Promise<any>((resolve, reject) => {
            this.processDesignerStore.errorTabIndex.mutate(-1);
            //TabManager.addLoadingToButton(this as any, ActionButtonIds.edit);

            //this.currentProcessStore.actions.checkOutProcess.dispatch().then(() => {
            //    TabManager.removeLoadingFromButton(this as any, ActionButtonIds.edit);
            //    this.processDesignerStore.actions.setEditorToCheckedOutMode.dispatch();
            //    resolve();
            //}).catch(reject);
            this.processDesignerStore.actions.setEditorToCheckedOutMode.dispatch();
        });
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
            notCheckedOutActionButtons: ActionButtonFactory.createDefaultRootProcessNotCheckoutedButtons(this),
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
    protected propertiesTab: TabRegistration = {
        tabId: "786bdd1a-133f-4d45-9adc-8add66365762",
        tabRenderer: new ProcessPropertiesTabRenderer(),
        tabName: this.opmCoreLoc.Process.Properties,
        active: false,
        actionToolbar: {
            editorDisplayActionButtons: ActionButtonFactory.createDisplaySettingsButtons(),
            checkedOutButtons: ActionButtonFactory.createDefaultCheckoutedButtons(this),
            notCheckedOutActionButtons: ActionButtonFactory.createDefaultRootProcessNotCheckoutedButtons(this),
        }
    };

    tabs: Array<TabRegistration> = [this.drawingTab, this.contentTab, this.documentsTab, this.linksTab, this.tasksTab, this.propertiesTab];

    constructor() {
        super();
    }
}