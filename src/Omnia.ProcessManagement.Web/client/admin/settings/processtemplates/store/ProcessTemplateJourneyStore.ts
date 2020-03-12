import { Store, StoreState } from '@omnia/fx/store';
import { Injectable, Inject } from '@omnia/fx';
import { InstanceLifetimes, GuidValue } from '@omnia/fx-models';
import { ProcessTemplate, ShapeDefinition, ShapeDefinitionTypes } from '../../../../fx/models';

@Injectable({
    onStartup: (storeType) => { Store.register(storeType, InstanceLifetimes.Singelton) }
})
export class ProcessTemplateJourneyStore extends Store {
    private editingProcessTemplate = this.state<ProcessTemplate>(null);
    private editingProcessTemplateTitle = this.state<string>("");

    private editingShapeDefinition = this.state<ShapeDefinition>(null);
    private editingShapeDefinitionIndex = this.state<number>(-1);
    private editingShapeDefinitionTitle = this.state<string>("");
    private editingShapeDefinitionType = this.state<ShapeDefinitionTypes>(null);

    constructor() {
        super({
            id: "a5556a97-b88b-461e-8cfa-e3411e4328ae"
        });
    }

    getters = {
        onEditingProcessTemplateMutated: () => {
            return this.editingProcessTemplate.onMutated
        },
        editingProcessTemplate: () => this.editingProcessTemplate.state,
        editingProcessTemplateTitle: () => this.editingProcessTemplateTitle.state,
        editingShapeDefinition: () => this.editingShapeDefinition.state,
        editingShapeDefinitionTitle: () => this.editingShapeDefinitionTitle.state,
        editingShapeDefinitionType: () => this.editingShapeDefinitionType.state,
        editingShapeDefinitionIndex: () => this.editingShapeDefinitionIndex.state
    }

    mutations = {
        setEditingProcessTemplate: this.mutation((processTemplate: ProcessTemplate) => {
            this.editingProcessTemplate.mutate(processTemplate);
            this.editingProcessTemplateTitle.mutate(processTemplate ? processTemplate.multilingualTitle : '');
        }),
        setEditingShapeDefinition: this.mutation((shapeDefinition: ShapeDefinition, index: number = -1) => {
            this.editingShapeDefinition.mutate(shapeDefinition);
            this.editingShapeDefinitionTitle.mutate(shapeDefinition ? shapeDefinition.multilingualTitle : '');
            this.editingShapeDefinitionType.mutate(shapeDefinition ? shapeDefinition.type : null);
            this.editingShapeDefinitionIndex.mutate(index);
        }),
        setEditingShapeDefinitionType: this.mutation((type: ShapeDefinitionTypes) => {
            this.editingShapeDefinitionType.mutate(type);
        })
    }

    protected onActivated() {

    }
    protected onDisposing() {

    }
}

