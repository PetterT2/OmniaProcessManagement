import { Inject, Localize, Utils as omfUtils, ServiceContainer } from '@omnia/fx';
import { CurrentProcessStore, OPMRouter } from '../../fx';
import { ProcessDesignerStore } from '../stores';
import { ProcessDesignerUtils } from '../../processdesigner/Utils';
import { FormValidator } from '@omnia/fx/ux';
import { TabManager } from '../core';
import { ActionButtonIds } from '../factory/ActionButtonIds';

export class ProcessStepDesignerItemBase {
    currentProcessStore: CurrentProcessStore;
    processDesignerStore: ProcessDesignerStore;
    formValidator: FormValidator = null;

    constructor() {
        this.currentProcessStore = ServiceContainer.createInstance(CurrentProcessStore);
        this.processDesignerStore = ServiceContainer.createInstance(ProcessDesignerStore);
        this.formValidator = new FormValidator();
    }

    //@Localize(EditorLocalization.namespace) editorLoc: EditorLocalization.locInterface;

    public onSaveAsDraft() {
        if (this.formValidator.validateAll()) {
            TabManager.addLoadingToButton(this as any, ActionButtonIds.saveasdraft);
            this.currentProcessStore.actions.checkIn.dispatch().then(() => {
                TabManager.removeLoadingFromButton(this as any, ActionButtonIds.saveasdraft);
                this.handleCloseDesinger();
                ProcessDesignerUtils.closeProcessDesigner();
            });
            return new Promise<any>(() => {
            });
        }
    }
    public onDiscardChanges() {
        this.formValidator.clearValidation();
        TabManager.addLoadingToButton(this as any, ActionButtonIds.discardchanges)
        this.currentProcessStore.actions.discardChange.dispatch().then(() => {
            TabManager.removeLoadingFromButton(this as any, ActionButtonIds.discardchanges);
            this.handleCloseDesinger();
            ProcessDesignerUtils.closeProcessDesigner();
        });
        return new Promise<any>(() => {
        });
    }
    public onClose() {
        this.handleCloseDesinger();
        this.formValidator.clearValidation();
        ProcessDesignerUtils.closeProcessDesigner();
        return new Promise<any>(() => {
        });
    }

    private handleCloseDesinger() {
        this.processDesignerStore.mutations.setHasDataChangedState.commit(null);
        OPMRouter.clearRoute();
    }
}