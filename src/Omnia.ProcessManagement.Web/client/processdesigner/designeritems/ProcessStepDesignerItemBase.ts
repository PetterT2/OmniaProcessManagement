import { Inject, Localize, Utils as omfUtils, ServiceContainer } from '@omnia/fx';
import { CurrentProcessStore, ProcessStore, OPMRouter } from '../../fx';
import { ProcessDesignerStore } from '../stores';
import { ProcessDesignerUtils } from '../../processdesigner/Utils';
import { FormValidator } from '@omnia/fx/ux';
import { TabManager } from '../core';
import { ActionButtonIds } from '../factory/ActionButtonIds';

export class ProcessStepDesignerItemBase {
    currentProcessStore: CurrentProcessStore;
    processDesignerStore: ProcessDesignerStore;
    processStore: ProcessStore;
    formValidator: FormValidator = null;

    constructor() {
        this.currentProcessStore = ServiceContainer.createInstance(CurrentProcessStore);
        this.processDesignerStore = ServiceContainer.createInstance(ProcessDesignerStore);
        this.processStore = ServiceContainer.createInstance(ProcessStore);
        this.formValidator = new FormValidator();
    }

    //@Localize(EditorLocalization.namespace) editorLoc: EditorLocalization.locInterface;

    public onCheckIn() {
        if (this.formValidator.validateAll()) {
            TabManager.addLoadingToButton(this as any, ActionButtonIds.checkin);
            this.processDesignerStore.actions.saveState.dispatch(false).then(() => {
                this.currentProcessStore.actions.checkIn.dispatch().then(() => {
                    TabManager.removeLoadingFromButton(this as any, ActionButtonIds.checkin);
                    this.handleCloseDesinger();
                    ProcessDesignerUtils.closeProcessDesigner();
                });
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
        this.processDesignerStore.actions.showDesigner.dispatch(false);
        OPMRouter.clearRoute();
    }
}