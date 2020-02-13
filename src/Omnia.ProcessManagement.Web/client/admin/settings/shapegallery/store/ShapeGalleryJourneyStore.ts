import { Store, StoreState } from '@omnia/fx/store';
import { Injectable, Inject } from '@omnia/fx';
import { InstanceLifetimes, GuidValue } from '@omnia/fx-models';
import { ShapeTemplate } from '../../../../fx/models';

@Injectable({
    onStartup: (storeType) => { Store.register(storeType, InstanceLifetimes.Singelton) }
})
export class ShapeGalleryJourneyStore extends Store {
    private editingShapeGalleryItem = this.state<ShapeTemplate>(null);
    private editingShapeGalleryItemTitle = this.state<string>("");

    constructor() {
        super({
            id: "e1dadfd6-c7b2-4bcb-aa4e-566cfa0bb846"
        });
    }

    getters = {
        editingShapeGalleryItem: () => this.editingShapeGalleryItem.state,
        editingShapeGalleryItemTitle: () => this.editingShapeGalleryItemTitle.state
    }

    mutations = {
        setEditingShapeGalleryItem: this.mutation((processTemplate: ShapeTemplate) => {
            this.editingShapeGalleryItem.mutate(processTemplate);
            this.editingShapeGalleryItemTitle.mutate(processTemplate ? processTemplate.multilingualTitle : '');
        })
    }

    protected onActivated() {

    }
    protected onDisposing() {

    }
}

