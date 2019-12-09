import { Inject, Localize, Utils, WebComponentBootstrapper, vueCustomElement } from '@omnia/fx';

import Component from 'vue-class-component';
import 'vue-tsx-support/enable-check';
import { Guid, IMessageBusSubscriptionHandler } from '@omnia/fx-models';
import { OmniaTheming, VueComponentBase, DialogPositions, OmniaUxLocalizationNamespace, OmniaUxLocalization, DialogStyles, HeadingStyles } from '@omnia/fx/ux';
import { Prop } from 'vue-property-decorator';
//import { CurrentProcessStore } from '../../../../fx';
import { ProcessDesignerStore } from '../../../stores';
import { ProcessDesignerLocalization } from '../../../loc/localize';
import './AddShape.css';
import { AddShapeWizardStore } from '../../../stores/AddShapeWizardStore';
import { AddShapeStep } from '../../../../models/processdesigner';

export interface AddShapePanelProps {
    
}

@Component
export class AddShapePanelComponent extends VueComponentBase<AddShapePanelProps, {}, {}>{
    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    //@Inject(CurrentProcessStore) currentProcessStore: CurrentProcessStore;
    @Inject(ProcessDesignerStore) processDesignerStore: ProcessDesignerStore;
    @Inject(AddShapeWizardStore) addShapeWizardStore: AddShapeWizardStore;
    @Localize(ProcessDesignerLocalization.namespace) pdLoc: ProcessDesignerLocalization.locInterface;
    @Localize(OmniaUxLocalizationNamespace) omniaLoc: OmniaUxLocalization;

    private subscriptionHandler: IMessageBusSubscriptionHandler = null;
    private openedImageDialog: boolean = false;
    private headingStyle: typeof HeadingStyles = {
        wrapper: DialogStyles.heading
    };

    created() {
        this.init();
    }

    init() {
        this.addShapeWizardStore.currentStepIndex.mutate(1);
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
     
    private renderSteps(h) {
        let wizardSteps: Array<AddShapeStep> = [];
        if (this.addShapeWizardStore.wizardSteps.state) {
            wizardSteps = this.addShapeWizardStore.wizardSteps.state;
        }
       let stepsElement: JSX.Element = null;
        if (wizardSteps.length > 0) {
            stepsElement =
                <v-stepper value={this.addShapeWizardStore.currentStepIndex.state} class={[this.omniaTheming.promoted.body.class]}>
                    {this.renderStepContents(h, wizardSteps)}
                </v-stepper>;
        }
        return stepsElement;
    }

    private renderStepContents(h, wizardSteps: Array<AddShapeStep>) {
        return wizardSteps.map((stepItem, idx) =>
            <v-stepper-content step={idx + 1}>
                {
                    idx == this.addShapeWizardStore.currentStepIndex.state - 1 ?
                        h(stepItem.elementToRender) : null
                }
            </v-stepper-content>
        );
    }
    private renderStatisSteps(h) {
        return <v-stepper value={this.addShapeWizardStore.currentStepIndex.state} class={[this.omniaTheming.promoted.body.class]}>
            <v-stepper-content step={1}>
                {this.addShapeWizardStore.currentStepIndex.state == 1 ? <opm-processdesigner-shapeselection-step></opm-processdesigner-shapeselection-step> : <div />}
            </v-stepper-content>
            <v-stepper-content step={2}>
                {this.addShapeWizardStore.currentStepIndex.state == 2 ? <opm-processdesigner-shapetype-step></opm-processdesigner-shapetype-step> : <div />}
            </v-stepper-content>
        </v-stepper>
    }
    get dialogTitle() {
        let result = '';
        result = this.addShapeWizardStore.wizardSteps.state[this.addShapeWizardStore.currentStepIndex.state - 1].title;
        return result;
    }


    visible: boolean = true;
    /**
        * Render 
        * @param h
        */
     render(h) {
        return <omfx-dialog
            onClose={this.onClose}
            model={{ visible: true }}
            maxWidth="800px"
            dark={this.omniaTheming.promoted.header.dark}
            contentClass={this.omniaTheming.promoted.body.class}
            position={DialogPositions.Center}
        >
            <div style={{ height: '100%' }}>
                <div>
                    <div class={this.omniaTheming.promoted.header.class}>
                        <omfx-heading styles={this.headingStyle} size={0}>{this.dialogTitle}</omfx-heading>
                    </div>
                    <v-container>
                        {this.renderStatisSteps(h)}
                        <div onClick={this.onClose}>Close</div>
                    </v-container>
                </div>
            </div>
        </omfx-dialog>
    }
}


WebComponentBootstrapper.registerElement((manifest) => {
    vueCustomElement(manifest.elementName, AddShapePanelComponent, { destroyTimeout: 1000 });
});

