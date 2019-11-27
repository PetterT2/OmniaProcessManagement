import { Inject, Localize,Utils as omfUtils} from '@omnia/fx';
import { CurrentProcessStore } from '../../fx';
import { TabManager } from '../panelrenderers';

export class ProcessStepDesignerItemBase {

    @Inject(CurrentProcessStore) currentProcessStore: CurrentProcessStore;

    //@Localize(EditorLocalization.namespace) editorLoc: EditorLocalization.locInterface;

    public onSave() {
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
        return new Promise<any>(() => {
        });
    }
    public onCheckOut() {
        //todo
        return new Promise<any>(() => {
        });
    }
    public onDiscardChanges() {
        //todo
        return new Promise<any>(() => {
        });
    }
}