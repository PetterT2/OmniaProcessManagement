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

    private editingProcessTemplateShapeDefinition = this.state<ShapeDefinition>(null);
    private editingProcessTemplateShapeDefinitionTitle = this.state<string>("");
    private editingShapeDefinitionType = this.state<ShapeDefinitionTypes>(null);

    constructor() {
        super({
            id: "a5556a97-b88b-461e-8cfa-e3411e4328ae"
        });
    }

    getters = {
        editingProcessTemplate: () => this.editingProcessTemplate.state,
        editingProcessTemplateTitle: () => this.editingProcessTemplateTitle.state,
        editingShapeDefinition: () => this.editingProcessTemplateShapeDefinition.state,
        editingShapeDefinitionTitle: () => this.editingProcessTemplateShapeDefinitionTitle.state,
        editingShapeDefinitionType: () => this.editingShapeDefinitionType.state
    }

    mutations = {
        setEditingProcessTemplate: this.mutation((processTemplate: ProcessTemplate) => {
            this.editingProcessTemplate.mutate(processTemplate);
            this.editingProcessTemplateTitle.mutate(processTemplate ? processTemplate.multilingualTitle : '');
        }),
        setEditingShapeDefinition: this.mutation((shapeDefinition: ShapeDefinition) => {
            this.editingProcessTemplateShapeDefinition.mutate(shapeDefinition);
            this.editingProcessTemplateShapeDefinitionTitle.mutate(shapeDefinition ? shapeDefinition.multilingualTitle : '');
            this.editingShapeDefinitionType.mutate(shapeDefinition ? shapeDefinition.type : null);
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

