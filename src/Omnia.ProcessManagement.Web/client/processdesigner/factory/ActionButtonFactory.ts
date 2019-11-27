import { Inject, OmniaContext, Localize } from '@omnia/fx';
import { OmniaTheming, OmniaUxLocalizationNamespace, OmniaUxLocalization } from '@omnia/fx/ux';
import { ProcessStepDesignerItemBase } from '../designeritems/ProcessStepDesignerItemBase';
import { ActionItem, ActionItemType, ActionButton } from '../../models/processdesigner';
import { ActionButtonIds } from './ActionButtonIds';
import { ProcessDesignerStore } from '../stores';

export class ActionButtonFactory {
    @Inject(ProcessDesignerStore) static processDesignerStore: ProcessDesignerStore;
    @Inject(OmniaTheming) static omniaTheming: OmniaTheming;
    @Inject(OmniaContext) static omniaCtx: OmniaContext;

    //@Localize(PublishingAppLocalization.namespace) static loc: PublishingAppLocalization.locInterface;
    //@Localize(EditorLocalization.namespace) static editorLoc: EditorLocalization.locInterface;
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
            title: "Discard",//this.loc.ActionButtons.CancelApproval,//todo
            visibilityCallBack: () => { return true; } //() => { return PageRules.canCancelApproval() && PageRules.haveApprovalProcess() },//todo
        } as ActionButton
    }

    static saveButton(editorItem: ProcessStepDesignerItemBase, highLighted: boolean): ActionItem {
        return {
            type: ActionItemType.Button,
            loading: false,
            disabled: false,
            id: ActionButtonIds.save,
            actionCallback: editorItem.onSave.bind(editorItem),
            highLighted: highLighted,
            icon: "",
            title: this.omniaLoc.Common.Buttons.Save,
            visibilityCallBack: () => { return true; } //() => { return PageRules.canCancelApproval() && PageRules.haveApprovalProcess() },//todo
        } as ActionButton
    }

    static editButton(editorItem: ProcessStepDesignerItemBase, highLighted: boolean): ActionItem {
        return {
            type: ActionItemType.Button,
            loading: false,
            disabled: false,
            id: ActionButtonIds.save,
            actionCallback: editorItem.onCheckOut.bind(editorItem),
            highLighted: highLighted,
            icon: "",
            title: this.omniaLoc.Common.Buttons.Edit,
            visibilityCallBack: () => { return true; } //() => { return PageRules.canCancelApproval() && PageRules.haveApprovalProcess() },//todo
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
            this.editButton(editorItem, true),
            this.closeButton(editorItem, false),
        ]
    }    

    static createDefaultCheckoutedButtons(editorItem: ProcessStepDesignerItemBase): Array<ActionItem> {
        return [
            this.discardChangesButton(editorItem, false),
            this.saveButton(editorItem, true),
            this.closeButton(editorItem, false),
        ]
    }

}

