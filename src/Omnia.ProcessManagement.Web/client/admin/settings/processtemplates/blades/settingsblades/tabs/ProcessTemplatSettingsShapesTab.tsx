import { Inject, Localize, Utils } from '@omnia/fx';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import * as tsx from 'vue-tsx-support';
import { JourneyInstance, OmniaTheming, StyleFlow, OmniaUxLocalizationNamespace, OmniaUxLocalization, ConfirmDialogDisplay, ConfirmDialogResponse, VueComponentBase } from '@omnia/fx/ux';
import { OPMAdminLocalization } from '../../../../../loc/localize';
import { ProcessTemplatesJourneyBladeIds } from '../../../ProcessTemplatesJourneyConstants';
import { ProcessTemplateJourneyStore } from '../../../store';
import { ProcessTemplate, ShapeDefinition, ShapeDefinitionTypes, ShapeDefinitionFactory } from '../../../../../../fx/models';

interface ProcessTemplatSettingsShapesTabProps {
    journey: () => JourneyInstance;
    editingProcessTemplate: ProcessTemplate;
}

@Component
export default class ProcessTemplatSettingsShapesTab extends VueComponentBase<ProcessTemplatSettingsShapesTabProps> {
    @Prop() journey: () => JourneyInstance;
    @Prop() editingProcessTemplate: ProcessTemplate;

    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Inject(ProcessTemplateJourneyStore) processTemplateJournayStore: ProcessTemplateJourneyStore;

    @Localize(OmniaUxLocalizationNamespace) omniaUxLoc: OmniaUxLocalization;
    @Localize(OPMAdminLocalization.namespace) loc: OPMAdminLocalization.locInterface;

    isLoading: boolean = true;

    private shapes: Array<ShapeDefinition> = []

    created() {
        var editingProcessTemplate = this.processTemplateJournayStore.getters.editingProcessTemplate();
        this.shapes = (editingProcessTemplate.settings && editingProcessTemplate.settings.shapeDefinitions) ? editingProcessTemplate.settings.shapeDefinitions : [];
    }

    openShapeSettingBlade(shape?: ShapeDefinition, index: number = -1) {
        this.journey().travelBackToFirstBlade();
        this.journey().travelToNext(ProcessTemplatesJourneyBladeIds.processTemplateSettingsDefault);
        this.$nextTick(() => {
            let shapeItem = shape || ShapeDefinitionFactory.createDefaultProcessTemplate();
            this.processTemplateJournayStore.mutations.setEditingShapeDefinition.commit(shapeItem, index);
            this.journey().travelToNext(ProcessTemplatesJourneyBladeIds.processTemplateSettingsShapes);
        });
    }

    travelToEditShape(shape: ShapeDefinition, index: number) {
        this.openShapeSettingBlade(Utils.clone(shape), index);
    }

    travelToAddShape(shape?: ShapeDefinition) {
        this.openShapeSettingBlade(shape);
    }

    updateShapes() {
        var editingProcessTemplate = this.processTemplateJournayStore.getters.editingProcessTemplate();
        editingProcessTemplate.settings.shapeDefinitions = this.shapes;
        this.processTemplateJournayStore.mutations.setEditingProcessTemplate.commit(editingProcessTemplate);
    }

    removeShape(index: number) {
        this.shapes.splice(index, 1);
        this.updateShapes();
    }

    render(h) {
        return (
            <div>
                <div class='text-right'>
                    <v-btn dark={this.omniaTheming.promoted.body.dark} text onClick={() => { this.travelToAddShape(ShapeDefinitionFactory.createDefaultProcessTemplate(ShapeDefinitionTypes.Heading)) }}>{this.loc.ProcessTemplates.AddHeading}</v-btn>
                    <v-btn dark={this.omniaTheming.promoted.body.dark} text onClick={() => { this.travelToAddShape() }}>{this.loc.ProcessTemplates.AddShape}</v-btn>
                </div>
                {
                    this.shapes && this.shapes.length > 0 ?
                        <draggable
                            options={{ handle: ".drag-handle", animation: "100" }}
                            element="v-list"
                            v-model={this.shapes}
                            onChange={this.updateShapes}>
                            {
                                this.shapes.map((shape, index) => {

                                    return (
                                        <v-list-item>
                                            <v-list-item-action>
                                                <v-btn icon class="mr-0" onClick={() => { }}>
                                                    <v-icon class="drag-handle" size='14'>fas fa-grip-lines</v-icon>
                                                </v-btn>
                                            </v-list-item-action>
                                            <v-list-item-content>{shape.multilingualTitle}</v-list-item-content>
                                            <v-list-item-action>
                                                <v-btn icon class="mr-0" onClick={() => { this.travelToEditShape(shape, index); }}>
                                                    <v-icon size='18'>fas fa-pencil-alt</v-icon>
                                                </v-btn>
                                            </v-list-item-action>
                                            <v-list-item-action>
                                                <omfx-confirm-dialog
                                                    icon="far fa-trash-alt"
                                                    styles={{ icon: { fontSize: "18px !important" }, button: { marginLeft: "0px !important" } }}
                                                    type={ConfirmDialogDisplay.Icon}
                                                    onClose={(res) => { res == ConfirmDialogResponse.Ok && this.removeShape(index) }}>
                                                </omfx-confirm-dialog>
                                            </v-list-item-action>
                                        </v-list-item>
                                    )
                                })
                            }
                        </draggable>
                        :
                        <v-list>
                            <v-list-item>
                                <v-list-item-content>{this.loc.ProcessTemplates.Messages.NoShapeTemplate}</v-list-item-content>
                            </v-list-item>
                        </v-list>
                }
                
            </div>
        );
    }
}