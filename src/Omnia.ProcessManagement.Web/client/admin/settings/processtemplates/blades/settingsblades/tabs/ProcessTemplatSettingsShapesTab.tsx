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

    private shapes: Array<ShapeDefinition> = [
        {
            title: {
                isMultilingualString: true,
                "en-us": "Freeform"
            },
            type: ShapeDefinitionTypes.Drawing,
            multilingualTitle: "Freeform"
        },
        {
            title: {
                isMultilingualString: true,
                "en-us": "Pentagon"
            },
            type: ShapeDefinitionTypes.Drawing,
            multilingualTitle: "Pentagon"
        },
        {
            title: {
                isMultilingualString: true,
                "en-us": "Media"
            },
            type: ShapeDefinitionTypes.Drawing,
            multilingualTitle: "Media"
        },
        {
            title: {
                isMultilingualString: true,
                "en-us": "Diamond"
            },
            type: ShapeDefinitionTypes.Drawing,
            multilingualTitle: "Diamond"
        }
    ]

    created() {

    }

    openShapeSettingBlade(shape?: ShapeDefinition) {
        this.journey().travelBackToFirstBlade();
        this.journey().travelToNext(ProcessTemplatesJourneyBladeIds.processTemplateSettingsDefault);
        let shapeItem = shape || ShapeDefinitionFactory.createDefaultProcessTemplate();
        this.processTemplateJournayStore.mutations.setEditingShapeDefinition.commit(shapeItem);
        this.journey().travelToNext(ProcessTemplatesJourneyBladeIds.processTemplateSettingsShapes);
    }

    travelToEditShape(shape: ShapeDefinition) {
        this.openShapeSettingBlade(Utils.clone(shape));
    }

    travelToAddShape(shape?: ShapeDefinition) {
        this.openShapeSettingBlade(shape);
    }

    private removeShape(index: number) {

    }

    render(h) {
        return (
            <div>
                <div class='text-right'>
                    <v-btn dark={this.omniaTheming.promoted.body.dark} text onClick={() => { this.travelToAddShape(ShapeDefinitionFactory.createDefaultProcessTemplate(ShapeDefinitionTypes.Heading)) }}>{this.loc.ProcessTemplates.AddHeading}</v-btn>
                    <v-btn dark={this.omniaTheming.promoted.body.dark} text onClick={() => { this.travelToAddShape() }}>{this.loc.ProcessTemplates.AddShape}</v-btn>
                </div>
                <draggable
                    options={{ handle: ".drag-handle", animation: "100" }}
                    element="v-list"
                    v-model={this.shapes}>
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
                                        <v-btn icon class="mr-0" onClick={() => { this.travelToEditShape(shape); }}>
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
            </div>
        );
    }
}