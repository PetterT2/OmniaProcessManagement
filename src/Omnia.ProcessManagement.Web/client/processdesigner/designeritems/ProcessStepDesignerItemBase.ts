import { Inject, Localize, Utils as omfUtils, ServiceContainer } from '@omnia/fx';
import { CurrentProcessStore, OPMRouter } from '../../fx';
import { ProcessDesignerStore } from '../stores';
import { ProcessDesignerUtils } from '../../processdesigner/Utils';

export class ProcessStepDesignerItemBase {
    currentProcessStore: CurrentProcessStore;
    processDesignerStore: ProcessDesignerStore;
    constructor() {
        this.currentProcessStore = ServiceContainer.createInstance(CurrentProcessStore);
        this.processDesignerStore = ServiceContainer.createInstance(ProcessDesignerStore);
    }

    //@Localize(EditorLocalization.namespace) editorLoc: EditorLocalization.locInterface;

    public onSaveAsDraft() {
        this.currentProcessStore.actions.checkIn.dispatch().then(() => {
            OPMRouter.clearRoute();
            ProcessDesignerUtils.closeProcessDesigner();
        });
        return new Promise<any>(() => {
        });
    }
    public onDiscardChanges() {
        this.currentProcessStore.actions.discardChange.dispatch().then(() => {
            OPMRouter.clearRoute();
            ProcessDesignerUtils.closeProcessDesigner();
        });
        return new Promise<any>(() => {
        });
    }
    public onClose() {
        OPMRouter.clearRoute();
        ProcessDesignerUtils.closeProcessDesigner();
        return new Promise<any>(() => {
        });
    }
}