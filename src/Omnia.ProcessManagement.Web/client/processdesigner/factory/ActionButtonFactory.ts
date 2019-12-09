import { Inject, OmniaContext, Localize } from '@omnia/fx';
import { OmniaTheming, OmniaUxLocalizationNamespace, OmniaUxLocalization } from '@omnia/fx/ux';
import { ProcessStepDesignerItemBase } from '../designeritems/ProcessStepDesignerItemBase';
import { ActionItem, ActionItemType, ActionButton, DisplayActionButton, DisplayModes } from '../../models/processdesigner';
import { ActionButtonIds } from './ActionButtonIds';
import { ProcessDesignerStore } from '../stores';
import { RootProcessStepDesignerItem } from '../designeritems/RootProcessStepDesignerItem';
import { OPMCoreLocalization } from '../../core/loc/localize';

export class ActionButtonFactory {
    @Inject(ProcessDesignerStore) static processDesignerStore: ProcessDesignerStore;
    @Inject(OmniaTheming) static omniaTheming: OmniaTheming;
    @Inject(OmniaContext) static omniaCtx: OmniaContext;

    @Localize(OPMCoreLocalization.namespace) static opmCoreLoc: OPMCoreLocalization.locInterface;
    @Localize(OmniaUxLocalizationNamespace) static omniaLoc: OmniaUxLocalization;

    static discardChangesButton(editorItem: ProcessStepDesignerItemBase, highLighted: boolean): ActionItem {
        return {
            type: ActionItemType.Button,
            loading: false,
            disabled: false,
            id: ActionButtonIds.save,
            actionCallback: editorItem.onDiscardChanges.bind(editorItem),
            highLighted: highLighted,
            icon: "",
            title: ActionButtonFactory.opmCoreLoc.Buttons.DiscardChanges,
            visibilityCallBack: () => { return true; }
        } as ActionButton
    }

    static saveAsDraftButton(editorItem: ProcessStepDesignerItemBase, highLighted: boolean): ActionItem {
        return {
            type: ActionItemType.Button,
            loading: false,
            disabled: false,
            id: ActionButtonIds.save,
            actionCallback: editorItem.onSaveAsDraft.bind(editorItem),
            highLighted: highLighted,
            icon: "",
            title: this.opmCoreLoc.Buttons.SaveAsDraft,
            visibilityCallBack: () => { return true; }
        } as ActionButton
    }

    static editRootProcessButton(editorItem: RootProcessStepDesignerItem, highLighted: boolean): ActionItem {
        return {
            type: ActionItemType.Button,
            loading: false,
            disabled: false,
            id: ActionButtonIds.save,
            actionCallback: editorItem.onCheckOut.bind(editorItem),
            highLighted: highLighted,
            icon: "",
            title: this.omniaLoc.Common.Buttons.Edit,
            visibilityCallBack: () => { return true; }
        } as ActionButton
    }

    static closeButton(editorItem: ProcessStepDesignerItemBase, highLighted: boolean): ActionItem {
        return {
            type: ActionItemType.Button,
            loading: false,
            disabled: false,
            id: ActionButtonIds.save,
            actionCallback: () => { return this.processDesignerStore.actions.showDesigner.dispatch(false) },
            highLighted: highLighted,
            icon: "",
            title: this.omniaLoc.Common.Buttons.Close
        } as ActionButton
    }

    static createDefaultNotCheckoutedButtons(editorItem: ProcessStepDesignerItemBase): Array<ActionItem> {
        return [
            //this.editButton(editorItem, true),
            this.closeButton(editorItem, false),
        ]
    }   

    static createDefaultRootProcessNotCheckoutedButtons(editorItem: RootProcessStepDesignerItem): Array<ActionItem> {
        return [
            this.editRootProcessButton(editorItem, true),
            this.closeButton(editorItem, false),
        ]
    } 

    static createDefaultCheckoutedButtons(editorItem: ProcessStepDesignerItemBase): Array<ActionItem> {
        return [
            this.discardChangesButton(editorItem, false),
            this.saveAsDraftButton(editorItem, true),
            this.closeButton(editorItem, false),
        ]
    }

    static createDisplaySettingsButtons(): Array<DisplayActionButton> {
        return [
            {
                type: ActionItemType.Button,
                actionCallback: null,
                highLighted: false,
                icon: "view_quilt",
                title: ActionButtonFactory.opmCoreLoc.Buttons.Design,
                displayMode: DisplayModes.contentEditing
            } as DisplayActionButton,
            {
                type: ActionItemType.Button,
                actionCallback: null,
                highLighted: false,
                icon: "phonelink",
                title: ActionButtonFactory.opmCoreLoc.Buttons.Preview,
                displayMode: DisplayModes.contentPreview
            } as DisplayActionButton
        ]
    }
}

