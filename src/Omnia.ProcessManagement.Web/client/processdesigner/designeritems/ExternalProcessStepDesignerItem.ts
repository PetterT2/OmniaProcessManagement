import { ProcessStepDesignerItemBase } from './ProcessStepDesignerItemBase';
import { IProcessDesignerItem, DisplayModes, ActionButton, TabRegistration } from '../../models/processdesigner';
import { ActionButtonFactory } from '../factory/ActionButtonFactory';
import { OPMCoreLocalization } from '../../core/loc/localize';
import { Localize } from '@omnia/fx';
import { ExternalProcessTabRenderer } from '../processstepcomponents/externalprocesses';

export class ExternalProcessStepDesignerItem extends ProcessStepDesignerItemBase implements IProcessDesignerItem {
    @Localize(OPMCoreLocalization.namespace) opmCoreLoc: OPMCoreLocalization.locInterface;
    onActivation() {
        
    }
    title: string;

    public settings = {
        defaultDisplayMode: DisplayModes.contentEditing,
    };   

    protected settingsTab: TabRegistration = {
        tabId: "11f85eee-49ab-4da5-92f0-62e5af6168fd",
        tabRenderer: new ExternalProcessTabRenderer(),
        tabName: this.opmCoreLoc.Process.LinkedProcess,
        active: true,
        actionToolbar: {
            editorDisplayActionButtons: [],
            checkedOutButtons: ActionButtonFactory.createDefaultCheckoutedButtons(this),
            notCheckedOutActionButtons: ActionButtonFactory.createDefaultNotCheckoutedButtons(this),
            checkedOutExtendedActionButtons: []
        }
    };

    tabs: Array<TabRegistration> = [this.settingsTab];

    constructor() {
        super();
    }
}