import { IEditorItem } from '../../../../models';
import { Inject } from '@omnia/fx';
import { CurrentPageStore } from '../../../../fx'
import { WCMPageTypes } from '../../../../fx/models';
import { PageEditorItem } from './PageEditorItem';
import { PageTypeEditorItem } from './PageTypeEditorItem';
import { PageCollectionEditorItem } from './PageCollectionEditorItem';
import { PageEditorItemWizard } from './PageEditorItemWizard';
import { AppEditorItem } from './AppEditorItem';

export interface IEditorItemFactory {
    createEditorItem(): IEditorItem
}


/**
 * Factory for Layout items
 * */
export class DesignerItemFactory implements IEditorItemFactory {
    @Inject(CurrentPageStore) currentPageStore: CurrentPageStore;
    public createEditorItem(): IEditorItem {
        let editorItem: IEditorItem = null;

        if (this.currentPageStore.getters.state) {
            switch (this.currentPageStore.getters.state.currentVersion.versionData.pageData.type) {
                case WCMPageTypes.pageCollection: {
                    editorItem = new PageCollectionEditorItem();
                    break;
                }
                case WCMPageTypes.pageType: {
                    editorItem = new PageTypeEditorItem();
                    break;
                }
                case WCMPageTypes.plainPage: {
                    if (this.currentPageStore.getters.state.currentVersion.versionData.majorVersion === 0) {
                        editorItem = new PageEditorItemWizard();
                    }
                    else {
                        editorItem = new PageEditorItem();
                    }
                    break;
                }
            }
        } else {
            editorItem = new AppEditorItem();
        }

        return editorItem;
    }
}

