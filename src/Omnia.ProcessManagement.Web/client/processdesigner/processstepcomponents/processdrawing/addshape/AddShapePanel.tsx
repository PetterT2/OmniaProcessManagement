import { Inject, Localize, Utils, WebComponentBootstrapper, vueCustomElement, IWebComponentInstance } from '@omnia/fx';

import Component from 'vue-class-component';
import 'vue-tsx-support/enable-check';
import { Guid, IMessageBusSubscriptionHandler } from '@omnia/fx-models';
import { OmniaTheming, VueComponentBase, OmniaUxLocalizationNamespace, OmniaUxLocalization, StyleFlow } from '@omnia/fx/ux';
import { ProcessDesignerStore } from '../../../stores';
import { ProcessDesignerLocalization } from '../../../loc/localize';
import { AddShapeWizardStore } from '../../../stores/AddShapeWizardStore';
import { AddShapeStep } from '../../../../models/processdesigner';
import { AddShapePanelStyles } from '../../../../fx/models';
import './AddShape.css';

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
    private addShapePanelStyles = StyleFlow.use(AddShapePanelStyles);

    created() {
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
            let wizardStep = wizardSteps[this.addShapeWizardStore.currentStepIndex.state - 1];
            stepsElement = h(wizardStep.elementToRender)
        }
        return stepsElement;
    }

    get dialogTitle() {
        let result = '';
        result = this.addShapeWizardStore.wizardSteps.state[this.addShapeWizardStore.currentStepIndex.state - 1].title;
        return result;
    }

    render(h) {
        return <div>
            <v-app-bar dark={this.theming.chrome.bg.dark}
                color={this.theming.chrome.bg.color.base}
                absolute
                scroll-off-screen
                scroll-target="#1scrolling-techniques-temp"
                flat>
                <v-toolbar-title>{this.dialogTitle}</v-toolbar-title>
                <v-spacer></v-spacer>
                <v-btn icon onClick={this.onClose}>
                    <v-icon>close</v-icon>
                </v-btn>
            </v-app-bar>
            {this.renderSteps()}
        </div>;      
    }
}


WebComponentBootstrapper.registerElement((manifest) => {
    vueCustomElement(manifest.elementName, AddShapePanelComponent, { destroyTimeout: 2000});
});

