import { Inject, Localize, Utils, WebComponentBootstrapper, vueCustomElement, IWebComponentInstance } from '@omnia/fx';

import Component from 'vue-class-component';
import 'vue-tsx-support/enable-check';
import { Guid, IMessageBusSubscriptionHandler } from '@omnia/fx-models';
import { OmniaTheming, VueComponentBase, OmniaUxLocalizationNamespace, OmniaUxLocalization, DialogStyles, HeadingStyles } from '@omnia/fx/ux';
import { ProcessDesignerStore } from '../../../stores';
import { ProcessDesignerLocalization } from '../../../loc/localize';
import './AddShape.css';
import { AddShapeWizardStore } from '../../../stores/AddShapeWizardStore';
import { AddShapeStep } from '../../../../models/processdesigner';

export interface AddShapePanelProps {
    
}

@Component
export class AddShapePanelComponent extends VueComponentBase implements IWebComponentInstance{
    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Inject(ProcessDesignerStore) processDesignerStore: ProcessDesignerStore;
    @Inject(AddShapeWizardStore) addShapeWizardStore: AddShapeWizardStore;
    @Localize(ProcessDesignerLocalization.namespace) pdLoc: ProcessDesignerLocalization.locInterface;
    @Localize(OmniaUxLocalizationNamespace) omniaLoc: OmniaUxLocalization;

    private subscriptionHandler: IMessageBusSubscriptionHandler = null;
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
     
    private renderSteps() {
        let h = this.$createElement;

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

    get dialogTitle() {
        let result = '';
        result = this.addShapeWizardStore.wizardSteps.state[this.addShapeWizardStore.currentStepIndex.state - 1].title;
        return result;
    }

    render(h) {
        return <div>
            <div class={this.omniaTheming.promoted.header.class}>
                <omfx-heading styles={this.headingStyle} size={0}>{this.dialogTitle}</omfx-heading>
            </div>
            <div>
                {this.renderSteps()}
           </div>
        </div>;      
    }
}


WebComponentBootstrapper.registerElement((manifest) => {
    vueCustomElement(manifest.elementName, AddShapePanelComponent, { destroyTimeout: 2000});
});

