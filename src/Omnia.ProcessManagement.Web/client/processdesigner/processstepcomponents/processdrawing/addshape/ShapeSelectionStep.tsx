import { Inject, Localize, WebComponentBootstrapper, vueCustomElement, Utils, IWebComponentInstance } from '@omnia/fx';

import Component from 'vue-class-component';
import 'vue-tsx-support/enable-check';
import { Guid, IMessageBusSubscriptionHandler } from '@omnia/fx-models';
import { OmniaTheming, VueComponentBase, StyleFlow, OmniaUxLocalizationNamespace, OmniaUxLocalization } from '@omnia/fx/ux';
import { Prop } from 'vue-property-decorator';
import { ProcessTemplateStore, CurrentProcessStore } from '../../../../fx';
import { ProcessDesignerStore } from '../../../stores';
import { ProcessDesignerLocalization } from '../../../loc/localize';
import { ShapeDefinition, DrawingShapeDefinition, CenterConfigurableHeightDialogStyles } from '../../../../fx/models';
import { MultilingualStore } from '@omnia/fx/store';
import { AddShapeWizardStore } from '../../../stores/AddShapeWizardStore';
import { ShapeSelectionComponent } from '../../../shapepickercomponents/ShapeSelection';
import '../../../../core/styles/CenterConfigurableHeightDialogStyles.css';

export interface ShapeSelectionStepProps {
}

@Component
export class ShapeSelectionStepComponent extends VueComponentBase<ShapeSelectionStepProps> implements IWebComponentInstance{
    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Inject(CurrentProcessStore) currentProcessStore: CurrentProcessStore;
    @Inject(ProcessDesignerStore) processDesignerStore: ProcessDesignerStore;
    @Inject(ProcessTemplateStore) processTemplateStore: ProcessTemplateStore;
    @Inject(AddShapeWizardStore) addShapeWizardStore: AddShapeWizardStore;
    @Inject(MultilingualStore) multilingualStore: MultilingualStore;
    @Localize(ProcessDesignerLocalization.namespace) pdLoc: ProcessDesignerLocalization.locInterface;
    @Localize(OmniaUxLocalizationNamespace) omniaLoc: OmniaUxLocalization;

    private subscriptionHandler: IMessageBusSubscriptionHandler = null;   
    private selectedShapeDefinition: ShapeDefinition = null;
    private myCenterDialogStyles = StyleFlow.use(CenterConfigurableHeightDialogStyles);

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

    private goToNext(shapeDefinition: DrawingShapeDefinition) {
        this.addShapeWizardStore.mutations.setSelectedShape.commit(shapeDefinition);
        this.addShapeWizardStore.mutations.goToNextStep.commit();
    }    
   
    private renderActionButtons(h) {
        return <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text
                color={this.omniaTheming.themes.primary.base}
                dark={this.omniaTheming.promoted.body.dark}
                disabled={!this.selectedShapeDefinition}
                onClick={this.goToNext}>{this.omniaLoc.Common.Buttons.Next}</v-btn>
            <v-btn text
                onClick={this.onClose}>{this.omniaLoc.Common.Buttons.Cancel}</v-btn>
        </v-card-actions>;
    }

    private onShapeSelected(selectedShapeDefinition: DrawingShapeDefinition) {
        this.goToNext(selectedShapeDefinition);
    }


    render(h) {
        return <v-card flat class={[this.myCenterDialogStyles.bodyWrapper]}>
            <v-card-text class={this.myCenterDialogStyles.contentWrapper}>
                <ShapeSelectionComponent shapeSelectedCallback={this.onShapeSelected}></ShapeSelectionComponent>
            </v-card-text>
            {this.renderActionButtons(h)}
        </v-card>;
    }
}


WebComponentBootstrapper.registerElement((manifest) => {
    vueCustomElement(manifest.elementName, ShapeSelectionStepComponent, { destroyTimeout: 1500 });
});
