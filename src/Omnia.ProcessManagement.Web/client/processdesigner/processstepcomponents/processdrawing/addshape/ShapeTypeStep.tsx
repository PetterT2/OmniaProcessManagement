import { Inject, Localize, WebComponentBootstrapper, vueCustomElement, Utils, IWebComponentInstance } from '@omnia/fx';

import Component from 'vue-class-component';
import 'vue-tsx-support/enable-check';
import { Guid, IMessageBusSubscriptionHandler, GuidValue, MultilingualString } from '@omnia/fx-models';
import { OmniaTheming, VueComponentBase, FormValidator, FieldValueValidation, OmniaUxLocalizationNamespace, OmniaUxLocalization, StyleFlow, DialogPositions } from '@omnia/fx/ux';
import { Prop } from 'vue-property-decorator';
import { CurrentProcessStore,  ProcessTemplateStore, DrawingCanvas } from '../../../../fx';
import { ProcessDesignerStore } from '../../../stores';
import { ProcessDesignerLocalization } from '../../../loc/localize';
import { DrawingShapeDefinition, DrawingShapeTypes, TextPosition, Enums, ProcessStep, DrawingShape, Link } from '../../../../fx/models';
import { ShapeDefinitionSelection, DrawingShapeOptions } from '../../../../models/processdesigner';
import { setTimeout } from 'timers';
import { MultilingualStore } from '@omnia/fx/store';
import { AddShapeWizardStore } from '../../../stores/AddShapeWizardStore';
import { OPMCoreLocalization } from '../../../../core/loc/localize';
import { ShapeTypeComponent } from '../../../shapepickercomponents/ShapeType';

export interface ShapeSelectionStepProps {
}

@Component
export class ShapeTypeStepComponent extends VueComponentBase<ShapeSelectionStepProps> implements IWebComponentInstance{
    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Inject(CurrentProcessStore) currentProcessStore: CurrentProcessStore;
    @Inject(ProcessDesignerStore) processDesignerStore: ProcessDesignerStore;
    @Inject(ProcessTemplateStore) processTemplateStore: ProcessTemplateStore;
    @Inject(AddShapeWizardStore) addShapeWizardStore: AddShapeWizardStore;
    @Inject(MultilingualStore) multilingualStore: MultilingualStore;
    @Localize(ProcessDesignerLocalization.namespace) pdLoc: ProcessDesignerLocalization.locInterface;
    @Localize(OPMCoreLocalization.namespace) opmCoreloc: OPMCoreLocalization.locInterface;
    @Localize(OmniaUxLocalizationNamespace) omniaLoc: OmniaUxLocalization;

    private subscriptionHandler: IMessageBusSubscriptionHandler = null;
    private selectedShapeDefinition: DrawingShapeDefinition = null;//ToDo check other type?
    private internalValidator: FormValidator = new FormValidator(this);    
    private isCreatingChildStep: boolean = false;
    private drawingShapeOptions: DrawingShapeOptions = null;

    created() {
        this.init();
    }

    mounted() {
        WebComponentBootstrapper.registerElementInstance(this, this.$el);
    }
       
    init() {
        this.selectedShapeDefinition = Utils.clone(this.addShapeWizardStore.selectedShape.state);
        this.drawingShapeOptions = {
            processStepId: Guid.empty,
            shapeDefinition: this.selectedShapeDefinition,
            shapeType: DrawingShapeTypes.ProcessStep,
            title: this.selectedShapeDefinition.title
        };
    }

    beforeDestroy() {
        if (this.subscriptionHandler)
            this.subscriptionHandler.unsubscribe();
    }

    private changeShape() {
        this.addShapeWizardStore.actions.goToPreviousStep.dispatch();
    }

    private onClose() {
        this.processDesignerStore.panels.mutations.toggleAddShapePanel.commit(false);
    }

    private createShape() {
        if (this.internalValidator.validateAll()) {
            let readyToDrawShape: boolean = true;

            if (this.drawingShapeOptions.shapeType == DrawingShapeTypes.ProcessStep) {
                if (this.drawingShapeOptions.processStepId == Guid.empty)
                {
                    this.isCreatingChildStep = true;
                    readyToDrawShape = false;

                    this.currentProcessStore.actions.addProcessStep.dispatch(this.drawingShapeOptions.title).then((result) => {
                        this.isCreatingChildStep = false;
                        this.drawingShapeOptions.processStepId = result.processStep.id;
                        this.completedAddShape();
                    }).catch(() => {
                        this.isCreatingChildStep = false;
                    });
                }
            }

            if (readyToDrawShape) {
                this.completedAddShape();
            }
        }
    }

    private completedAddShape() {
        this.processDesignerStore.mutations.addShapeToDrawing.commit(this.drawingShapeOptions);
        this.processDesignerStore.actions.addRecentShapeDefinitionSelection.dispatch(this.addShapeWizardStore.selectedShape.state);
        this.onClose();
    }

    onChangedDrawingOptions(drawingOptions: DrawingShapeOptions) {
        this.drawingShapeOptions = drawingOptions;
    }

    private renderActionButtons(h) {
        return <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text
                color={this.omniaTheming.themes.primary.base}
                dark={this.omniaTheming.promoted.body.dark}
                loading={this.isCreatingChildStep}
                onClick={this.createShape}>{this.omniaLoc.Common.Buttons.Ok}</v-btn>
            <v-btn text
                onClick={this.onClose}>{this.omniaLoc.Common.Buttons.Cancel}</v-btn>
        </v-card-actions>;
    }
    /**
        * Render 
        * @param h
        */
    render(h) {
        return <v-card flat>
            <v-card-content>
                <ShapeTypeComponent
                    drawingOptions={this.drawingShapeOptions}
                    changeDrawingOptionsCallback={this.onChangedDrawingOptions}
                    changeShapeCallback={this.changeShape}
                    formValidator={this.internalValidator}
                ></ShapeTypeComponent>
            </v-card-content>
            {this.renderActionButtons(h)}
        </v-card>;
    }
}


WebComponentBootstrapper.registerElement((manifest) => {
    vueCustomElement(manifest.elementName, ShapeTypeStepComponent, { destroyTimeout: 1500 });
});
