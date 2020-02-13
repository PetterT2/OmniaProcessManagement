import { Guid, IMessageBusSubscriptionHandler, StateMutation } from '@omnia/fx-models';
import { ProcessStepDesignerItemBase } from './ProcessStepDesignerItemBase';
import { IProcessDesignerItem, DisplayModes, ActionButton, TabRegistration, ActionItem, ActionItemType } from '../../models/processdesigner';
import { ActionButtonFactory } from '../factory/ActionButtonFactory';
import { ProcessStepDrawingTabRenderer } from '../processstepcomponents/processdrawing';
import { ProcessPropertiesTabRenderer } from '../processstepcomponents/properties';
import { CurrentProcessStore } from '../../fx';
import { ServiceContainer, Localize, Inject } from '@omnia/fx';
import { ProcessContentTabRenderer } from '../processstepcomponents/content';
import { ProcessDocumentsTabRenderer } from '../processstepcomponents/documents';
import { ProcessLinksTabRenderer } from '../processstepcomponents/links';
import { ProcessTasksTabRenderer } from '../processstepcomponents/tasks';
import { OPMCoreLocalization } from '../../core/loc/localize';
import { ProcessDesignerLocalization } from '../loc/localize';
import { ProcessDesignerStore } from '../stores';

export class RootProcessStepDesignerItem extends ProcessStepDesignerItemBase implements IProcessDesignerItem {
    @Inject(ProcessDesignerStore) processDesignerStore: ProcessDesignerStore;

    @Localize(OPMCoreLocalization.namespace) opmCoreLoc: OPMCoreLocalization.locInterface;
    @Localize(ProcessDesignerLocalization.namespace) loc: ProcessDesignerLocalization.locInterface;

    onActivation() {

    }

    public onCheckOut() {
        return new Promise<any>((resolve, reject) => {
            this.currentProcessStore.actions.checkOut.dispatch().then(() => {
                this.processDesignerStore.actions.setEditorToCheckedOutMode.dispatch().then(resolve).catch(reject);
            }).catch(reject)
        });
    }

    title: string;

    public settings = {
        defaultDisplayMode: DisplayModes.contentEditing,
    };

    protected changeContentTypeButton: ActionButton = {
        type: ActionItemType.Button,
        actionCallback: () => {
            this.processDesignerStore.panels.mutations.toggleChangeProcessTypePanel.commit(true);
        },
        highLighted: false,
        icon: "swap_horiz",
        title: this.loc.ChangeProcessType,
        visibilityCallBack: () => {
            return this.processDesignerStore.settings.displayMode.state !== DisplayModes.contentPreview;
        },
    }

    protected createDefaultCheckedOutExtendedActionButtons: ActionItem[] = [this.changeContentTypeButton];

    protected drawingTab: TabRegistration = {
        tabId: "9bf78a25-3082-4333-80d1-55484a28efc0",
        tabRenderer: new ProcessStepDrawingTabRenderer(),
        tabName: this.opmCoreLoc.Process.Drawing,
        active: true,
        actionToolbar: {
            editorDisplayActionButtons: ActionButtonFactory.createDisplaySettingsButtons(this),
            checkedOutButtons: ActionButtonFactory.createDefaultCheckoutedButtons(this),
            notCheckedOutActionButtons: ActionButtonFactory.createDefaultRootProcessNotCheckoutedButtons(this),
            checkedOutExtendedActionButtons: this.createDefaultCheckedOutExtendedActionButtons
        }
    };

    protected contentTab: TabRegistration = {
        tabId: "836930a7-649f-43d7-8d17-e52ca665ab44",
        tabRenderer: new ProcessContentTabRenderer(),
        tabName: this.opmCoreLoc.Process.Content,
        active: false,
        actionToolbar: {
            editorDisplayActionButtons: ActionButtonFactory.createDisplaySettingsButtons(this),
            checkedOutButtons: ActionButtonFactory.createDefaultCheckoutedButtons(this),
            notCheckedOutActionButtons: ActionButtonFactory.createDefaultRootProcessNotCheckoutedButtons(this),
            checkedOutExtendedActionButtons: this.createDefaultCheckedOutExtendedActionButtons
        }
    };
    protected documentsTab: TabRegistration = {
        tabId: "d6b6b4c7-b307-44ff-b600-4e5b547814c9",
        tabRenderer: new ProcessDocumentsTabRenderer(),
        tabName: this.opmCoreLoc.Process.Documents,
        active: false,
        actionToolbar: {
            editorDisplayActionButtons: ActionButtonFactory.createDisplaySettingsButtons(this),
            checkedOutButtons: ActionButtonFactory.createDefaultCheckoutedButtons(this),
            notCheckedOutActionButtons: ActionButtonFactory.createDefaultRootProcessNotCheckoutedButtons(this),
            checkedOutExtendedActionButtons: this.createDefaultCheckedOutExtendedActionButtons
        }
    };
    protected linksTab: TabRegistration = {
        tabId: "eb86d6e0-7f50-4d67-84cf-a32c91bc7b6e",
        tabRenderer: new ProcessLinksTabRenderer(),
        tabName: this.opmCoreLoc.Process.Links,
        active: false,
        actionToolbar: {
            editorDisplayActionButtons: ActionButtonFactory.createDisplaySettingsButtons(this),
            checkedOutButtons: ActionButtonFactory.createDefaultCheckoutedButtons(this),
            notCheckedOutActionButtons: ActionButtonFactory.createDefaultRootProcessNotCheckoutedButtons(this),
            checkedOutExtendedActionButtons: this.createDefaultCheckedOutExtendedActionButtons
        }
    };
    protected tasksTab: TabRegistration = {
        tabId: "7627d1de-e49d-4a62-ab79-4b216fade62b",
        tabRenderer: new ProcessTasksTabRenderer(),
        tabName: this.opmCoreLoc.Process.Tasks,
        active: false,
        actionToolbar: {
            editorDisplayActionButtons: ActionButtonFactory.createDisplaySettingsButtons(this),
            checkedOutButtons: ActionButtonFactory.createDefaultCheckoutedButtons(this),
            notCheckedOutActionButtons: ActionButtonFactory.createDefaultRootProcessNotCheckoutedButtons(this),
            checkedOutExtendedActionButtons: this.createDefaultCheckedOutExtendedActionButtons
        }
    };

    protected propertiesTab: TabRegistration = {
        tabId: "786bdd1a-133f-4d45-9adc-8add66365762",
        tabRenderer: new ProcessPropertiesTabRenderer(this.formValidator),
        tabName: this.opmCoreLoc.Process.Properties,
        active: false,
        actionToolbar: {
            editorDisplayActionButtons: ActionButtonFactory.createDisplaySettingsButtons(this),
            checkedOutButtons: ActionButtonFactory.createDefaultCheckoutedButtons(this),
            notCheckedOutActionButtons: ActionButtonFactory.createDefaultRootProcessNotCheckoutedButtons(this),
            checkedOutExtendedActionButtons: []
        }
    };

    tabs: Array<TabRegistration> = [this.drawingTab, this.contentTab, this.documentsTab, this.linksTab, this.tasksTab, this.propertiesTab];

    constructor() {
        super();
    }
}