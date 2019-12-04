import { Inject, Localize, Utils, WebComponentBootstrapper, vueCustomElement } from '@omnia/fx';

import Component from 'vue-class-component';
import 'vue-tsx-support/enable-check';
import { Guid, IMessageBusSubscriptionHandler } from '@omnia/fx-models';
import { OmniaTheming, VueComponentBase, StyleFlow, MediaPickerProvider, MediaPickerProviderMediaTypes, DialogPositions, MediaPickerImageTransformerProviderResult, OmniaUxLocalizationNamespace, OmniaUxLocalization } from '@omnia/fx/ux';
import { Prop } from 'vue-property-decorator';
import { CurrentProcessStore } from '../../../../fx';
import { ProcessDesignerStore } from '../../../stores';
import { ProcessDesignerLocalization } from '../../../loc/localize';
import './AddShape.css';
import { AddShapeWizardStore } from '../../../stores/AddShapeWizardStore';
import { AddShapeStep } from '../../../../models/processdesigner';

export interface AddShapePanelProps {
    visible: boolean;
}

@Component
export class AddShapePanelComponent extends VueComponentBase<AddShapePanelProps, {}, {}>{
    @Prop() visible: boolean;

    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Inject(CurrentProcessStore) currentProcessStore: CurrentProcessStore;
    @Inject(ProcessDesignerStore) processDesignerStore: ProcessDesignerStore;
    @Inject(AddShapeWizardStore) addShapeWizardStore: AddShapeWizardStore;
    @Localize(ProcessDesignerLocalization.namespace) pdLoc: ProcessDesignerLocalization.locInterface;
    @Localize(OmniaUxLocalizationNamespace) omniaLoc: OmniaUxLocalization;

    private subscriptionHandler: IMessageBusSubscriptionHandler = null;
    private openedImageDialog: boolean = false;
    //canvasSettingsStyles = StyleFlow.use(DrawingCanvasSettingsStyles);
	//private stepperModel: number = 1;
	

    created() {
        this.init();
    }

    init() {

    }

    get wizardSteps() {
        let result: Array<AddShapeStep> = [];
        if (this.addShapeWizardStore.wizardSteps.state) {
            result = this.addShapeWizardStore.wizardSteps.state;
        }
        return result;
    }

    mounted() {
        WebComponentBootstrapper.registerElementInstance(this, this.$el);
    }

    beforeDestroy() {
        if (this.subscriptionHandler)
            this.subscriptionHandler.unsubscribe();
    }

    private onClose() {
        this.processDesignerStore.panels.mutations.toggleAddShapePanel.commit(false);
    }

    private renderStep(h, stepItem: AddShapeStep) {
		return h(stepItem.elementToRender);
    }
   
    private renderSteps(h) {
        let wizardSteps = this.wizardSteps;
        if (wizardSteps) {
            return (<v-stepper v-model={this.addShapeWizardStore.currentStepIndex} class={[this.omniaTheming.promoted.body.class]}>
                {
                    wizardSteps.map((stepItem, idx) => {
                        return <v-stepper-content step={idx}>
                            {this.renderStep(h, stepItem)}
                        </v-stepper-content>
                    })
                }
            </v-stepper>);
        }
        return null;
    }
    get dialogTitle() {
        let result = '';
        if (this.addShapeWizardStore.currentStep.state) {
            result = this.addShapeWizardStore.currentStep.state.title;
        }
        return result;
    }

    /**
        * Render 
        * @param h
        */
    render(h) {
        return <omfx-dialog
            scrollable={false}
            model={{ visible: true }}
            title={this.dialogTitle}
            onClose={this.onClose}
            maxWidth={"750px"}
            showCloseButton={true}
            position={DialogPositions.Center}>
            {
                this.renderSteps(h)
            }
        </omfx-dialog>
    }
}


WebComponentBootstrapper.registerElement((manifest) => {
    vueCustomElement(manifest.elementName, AddShapePanelComponent);
});

