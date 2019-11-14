import { Inject, Localize, Utils } from '@omnia/fx';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import * as tsx from 'vue-tsx-support';
import { JourneyInstance, OmniaTheming, StyleFlow, OmniaUxLocalizationNamespace, OmniaUxLocalization, ConfirmDialogDisplay, ConfirmDialogResponse, VueComponentBase } from '@omnia/fx/ux';
import { OPMAdminLocalization } from '../../../../../loc/localize';
import { ProcessTemplatesJourneyBladeIds } from '../../../ProcessTemplatesJourneyConstants';
import { ProcessTemplateJourneyStore } from '../../../store';

interface ProcessTemplatSettingsShapesTabProps {
    journey: () => JourneyInstance;
}

@Component
export default class ProcessTemplatSettingsShapesTab extends VueComponentBase<ProcessTemplatSettingsShapesTabProps> {
    @Prop() journey: () => JourneyInstance;

    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Inject(ProcessTemplateJourneyStore) processTemplateJournayStore: ProcessTemplateJourneyStore;

    @Localize(OmniaUxLocalizationNamespace) omniaUxLoc: OmniaUxLocalization;
    @Localize(OPMAdminLocalization.namespace) loc: OPMAdminLocalization.locInterface;

    isLoading: boolean = true;

    private shapes: Array<any> = [
        {
            id: "79E24826-62CC-4BA4-ABD1-396573D796A8",
            multilingualTitle: "Freeform"
        },
        {
            id: "79E24826-62CC-4BA4-ABD1-396573D796A8",
            multilingualTitle: "Pentagon"
        },
        {
            id: "79E24826-62CC-4BA4-ABD1-396573D796A8",
            multilingualTitle: "Media"
        },
        {
            id: "79E24826-62CC-4BA4-ABD1-396573D796A8",
            multilingualTitle: "Diamond"
        }
    ]

    created() {

    }

    openShapeSettingBlade(shape?: any) {
        this.journey().travelBackToFirstBlade();
        this.journey().travelToNext(ProcessTemplatesJourneyBladeIds.processTemplateSettingsDefault);
        let shapeItem = shape || null;
        this.processTemplateJournayStore.mutations.setEditingProcessTemplateShapeItem.commit(shapeItem);
        this.journey().travelToNext(ProcessTemplatesJourneyBladeIds.processTemplateSettingsShapes);
    }

    travelToEditShape(shape: any) {
        this.openShapeSettingBlade(Utils.clone(shape));
    }

    private removeShape(index: number) {

    }

    render(h) {
        return (
            <div>
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