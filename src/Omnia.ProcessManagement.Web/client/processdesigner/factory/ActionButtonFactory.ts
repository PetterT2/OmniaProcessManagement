import { Inject, OmniaContext, Localize } from '@omnia/fx';
import { OmniaTheming, OmniaUxLocalizationNamespace, OmniaUxLocalization, ConfirmDialogOptions } from '@omnia/fx/ux';
import { ProcessStepDesignerItemBase } from '../designeritems/ProcessStepDesignerItemBase';
import { ActionItem, ActionItemType, ActionButton, DisplayActionButton, DisplayModes } from '../../models/processdesigner';
import { ActionButtonIds } from './ActionButtonIds';
import { RootProcessStepDesignerItem } from '../designeritems/RootProcessStepDesignerItem';
import { OPMCoreLocalization } from '../../core/loc/localize';
import { ProcessDesignerLocalization } from '../loc/localize';
import { ProcessVersionType } from '../../fx/models';

export class ActionButtonFactory {
    @Inject(OmniaTheming) static omniaTheming: OmniaTheming;
    @Inject(OmniaContext) static omniaCtx: OmniaContext;

    @Localize(OPMCoreLocalization.namespace) static opmCoreLoc: OPMCoreLocalization.locInterface;
    @Localize(ProcessDesignerLocalization.namespace) static loc: ProcessDesignerLocalization.locInterface;
    @Localize(OmniaUxLocalizationNamespace) static omniaLoc: OmniaUxLocalization;

    static discardChangesButton(editorItem: ProcessStepDesignerItemBase, highLighted: boolean): ActionItem {
        return {
            type: ActionItemType.Button,
            loading: false,
            disabled: false,
            id: ActionButtonIds.discardchanges,
            confirmationOptions: {
                message: this.loc.DiscardChangeConfirmMessage,
                title: this.opmCoreLoc.Buttons.DiscardChanges
            },
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
            id: ActionButtonIds.saveasdraft,
            actionCallback: editorItem.onSaveAsDraft.bind(editorItem),
            highLighted: highLighted,
            icon: "",
            title: this.opmCoreLoc.Buttons.SaveAsDraft,
            visibilityCallBack: () => { return true; }
        } as ActionButton
    }

    static editRootProcessButton(editorItem: RootProcessStepDesignerItem, highLighted: boolean): ActionItem {
        let checkoutInfo = editorItem.processStore.getters.processCheckoutInfo(editorItem.currentProcessStore.getters.referenceData().process.opmProcessId);

        return {
            type: ActionItemType.Button,
            loading: false,
            disabled: !checkoutInfo || !checkoutInfo.canCheckout,
            id: ActionButtonIds.edit,
            actionCallback: editorItem.onCheckOut.bind(editorItem),
            highLighted: highLighted,
            icon: "",
            title: this.omniaLoc.Common.Buttons.Edit,
            visibilityCallBack: () => { return checkoutInfo && checkoutInfo.canCheckout ? true : false }
        } as ActionButton
    }

    static closeButton(editorItem: ProcessStepDesignerItemBase, highLighted: boolean): ActionItem {
        return {
            type: ActionItemType.Button,
            loading: false,
            disabled: false,
            id: ActionButtonIds.close,
            actionCallback: editorItem.onClose.bind(editorItem),
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

    static createDisplaySettingsButtons(editorItem: ProcessStepDesignerItemBase): Array<DisplayActionButton> {
        return [
            {
                type: ActionItemType.Button,
                actionCallback: null,
                highLighted: false,
                icon: "view_quilt",
                title: ActionButtonFactory.opmCoreLoc.Buttons.Design,
                displayMode: DisplayModes.contentEditing,
                visibilityCallBack: () => { return editorItem.currentProcessStore.getters.referenceData().process.versionType == ProcessVersionType.CheckedOut; }
            } as DisplayActionButton,
            {
                type: ActionItemType.Button,
                actionCallback: null,
                highLighted: false,
                icon: "phonelink",
                title: ActionButtonFactory.opmCoreLoc.Buttons.Preview,
                displayMode: DisplayModes.contentPreview,
                visibilityCallBack: () => { return editorItem.currentProcessStore.getters.referenceData().process.versionType == ProcessVersionType.CheckedOut; }
            } as DisplayActionButton
        ]
    }
}

