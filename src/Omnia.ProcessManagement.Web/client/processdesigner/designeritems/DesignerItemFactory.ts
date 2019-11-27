import { IProcessDesignerItem } from '../../models/processdesigner';
import { Inject } from '@omnia/fx';
import { CurrentProcessStore } from '../../fx';
import { RootProcessStepDesignerItem } from './RootProcessStepDesignerItem';
import { ProcessStepDesignerItem } from './ProcessStepDesignerItem';

export interface IProcessDesignerItemFactory {
    createDesignerItem(): IProcessDesignerItem
}


/**
 * Factory for Layout items
 * */
export class ProcessDesignerItemFactory implements IProcessDesignerItemFactory {
    @Inject(CurrentProcessStore) currentProcessStore: CurrentProcessStore;

    public createDesignerItem(): IProcessDesignerItem {
        let designerItem: IProcessDesignerItem = null;
        let currentProcessData = this.currentProcessStore.getters.referenceData();
        if (currentProcessData) {
            if (currentProcessData.isRootProcessStep) {
                designerItem = new RootProcessStepDesignerItem();
            }
            else {
                designerItem = new ProcessStepDesignerItem();
            }
        }
        return designerItem;
    }
}

