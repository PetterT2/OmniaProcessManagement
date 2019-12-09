import { Inject, Localize,Utils as omfUtils, ServiceContainer} from '@omnia/fx';
import { CurrentProcessStore } from '../../fx';
import { ProcessDesignerStore } from '../stores';

export class ProcessStepDesignerItemBase {
    currentProcessStore: CurrentProcessStore;
    processDesignerStore: ProcessDesignerStore;
    constructor() {
        this.currentProcessStore = ServiceContainer.createInstance(CurrentProcessStore);
        this.processDesignerStore = ServiceContainer.createInstance(ProcessDesignerStore);
    }

    //@Localize(EditorLocalization.namespace) editorLoc: EditorLocalization.locInterface;

    public onSaveAsDraft() {
        //todo
        //if (this.validateAll()) {
        //    this.editorStore.mutations.stopSavePageStateManager.commit();
        //    TabManager.addLoadingToButton(this as any, ActionButtonIds.saveAsDraft);
        //    let operationPromise = this.currentPageStore.actions.checkIn.dispatch();
        //    operationPromise.then(() => {
        //        this.editorStore.actions.setEditorToReadMode.dispatch(true);
        //        TabManager.removeLoadingFromButton(this as any, ActionButtonIds.saveAsDraft);
        //    });
        //    return operationPromise;
        //}
        console.log("Save as draft");
        return new Promise<any>(() => {

        });
    }
    public onDiscardChanges() {
        //todo
        console.log("Discard changes");
        return new Promise<any>(() => {
        });
    }
    public onClose() {
        console.log("Close");
        return new Promise<any>(() => {
        });
    }
}