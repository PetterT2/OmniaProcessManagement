import { Store, StoreState } from '@omnia/fx/store';
import { Injectable, Inject } from '@omnia/fx';
import { InstanceLifetimes, GuidValue } from '@omnia/fx-models';
import { ProcessTemplate } from '../../../../fx/models';

@Injectable({
    onStartup: (storeType) => { Store.register(storeType, InstanceLifetimes.Singelton) }
})
export class ProcessTemplateJourneyStore extends Store {
    private editingProcessTemplate = this.state<ProcessTemplate>(null);
    private editingProcessTemplateTitle = this.state<string>("");

    private editingProcessTemplateShapeItem = this.state<ProcessTemplate>(null);
    private editingProcessTemplateShapeItemTitle = this.state<string>("");

    constructor() {
        super({
            id: "a5556a97-b88b-461e-8cfa-e3411e4328ae"
        });
    }

    getters = {
        editingProcessTemplate: () => this.editingProcessTemplate.state,
        editingProcessTemplateTitle: () => this.editingProcessTemplateTitle.state,
        editingProcessTemplateShapeItem: () => this.editingProcessTemplateShapeItem.state,
        editingProcessTemplateShapeItemTitle: () => this.editingProcessTemplateShapeItemTitle.state
    }

    mutations = {
        setEditingProcessTemplate: this.mutation((processTemplate: ProcessTemplate) => {
            this.editingProcessTemplate.mutate(processTemplate);
            this.editingProcessTemplateTitle.mutate(processTemplate ? processTemplate.multilingualTitle : '');
        }),
        setEditingProcessTemplateShapeItem: this.mutation((processTemplateShapeItem: ProcessTemplate) => {
            this.editingProcessTemplateShapeItem.mutate(processTemplateShapeItem);
            this.editingProcessTemplateTitle.mutate(processTemplateShapeItem ? processTemplateShapeItem.multilingualTitle : '');
        })
    }

    protected onActivated() {

    }
    protected onDisposing() {

    }
}

