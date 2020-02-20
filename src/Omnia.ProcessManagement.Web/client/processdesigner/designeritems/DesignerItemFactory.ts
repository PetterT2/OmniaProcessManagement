import { IProcessDesignerItem } from '../../models/processdesigner';
import { Inject, ServiceContainer } from '@omnia/fx';
import { CurrentProcessStore } from '../../fx';
import { RootProcessStepDesignerItem } from './RootProcessStepDesignerItem';
import { ProcessStepDesignerItem } from './ProcessStepDesignerItem';
import { ExternalProcessStepDesignerItem } from './ExternalProcessStepDesignerItem';

export interface IProcessDesignerItemFactory {
    createDesignerItem(): IProcessDesignerItem
}


/**
 * Factory for Layout items
 * */
export class ProcessDesignerItemFactory implements IProcessDesignerItemFactory {
    currentProcessStore: CurrentProcessStore;
    isExternalProcessStep: boolean;
    constructor(isExternalProcessStep?: boolean) {
        this.currentProcessStore = ServiceContainer.createInstance(CurrentProcessStore);
        this.isExternalProcessStep = isExternalProcessStep;
    }

    public createDesignerItem(): IProcessDesignerItem {
        let designerItem: IProcessDesignerItem = null;
        if (this.isExternalProcessStep) {
            designerItem = new ExternalProcessStepDesignerItem();
        }
        else {
            let currentProcessData = this.currentProcessStore.getters.referenceData();
            if (currentProcessData) {
                if (!currentProcessData.current.parentProcessStep) {
                    designerItem = new RootProcessStepDesignerItem();
                }
                else {
                    designerItem = new ProcessStepDesignerItem();
                }
            }
        }
        return designerItem;
    }
}

