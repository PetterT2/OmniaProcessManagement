import { Inject, Localize, WebComponentBootstrapper, vueCustomElement, Utils, IWebComponentInstance } from '@omnia/fx';

import Component from 'vue-class-component';
import 'vue-tsx-support/enable-check';
import { Guid, IMessageBusSubscriptionHandler, GuidValue, MultilingualString } from '@omnia/fx-models';
import { OmniaTheming, VueComponentBase, FormValidator, FieldValueValidation, OmniaUxLocalizationNamespace, OmniaUxLocalization, StyleFlow, DialogPositions, IValidator } from '@omnia/fx/ux';
import { Prop } from 'vue-property-decorator';
import { CurrentProcessStore, ProcessTemplateStore, DrawingCanvas, ShapeTemplateStore, ImageService } from '../../../../fx';
import { ProcessDesignerStore } from '../../../stores';
import { ProcessDesignerLocalization } from '../../../loc/localize';
import { DrawingShapeDefinition, DrawingShapeTypes, TextPosition, Enums, ProcessStep, DrawingShape, Link, ShapeTemplateType, DrawingFreeformShapeDefinition, DrawingImageShapeDefinition } from '../../../../fx/models';
import { ShapeDefinitionSelection, DrawingShapeOptions } from '../../../../models/processdesigner';
import { setTimeout } from 'timers';
import { MultilingualStore } from '@omnia/fx/store';
import { AddShapeWizardStore } from '../../../stores/AddShapeWizardStore';
import { OPMCoreLocalization } from '../../../../core/loc/localize';
import { ShapeTypeComponent } from '../../../shapepickercomponents/ShapeType';

export interface ShapeSelectionStepProps {
}

@Component
export class ShapeTypeStepComponent extends VueComponentBase<ShapeSelectionStepProps> implements IWebComponentInstance {
    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Inject(ImageService) imageService: ImageService;
    @Inject(CurrentProcessStore) currentProcessStore: CurrentProcessStore;
    @Inject(ProcessDesignerStore) processDesignerStore: ProcessDesignerStore;
    @Inject(ProcessTemplateStore) processTemplateStore: ProcessTemplateStore;
    @Inject(AddShapeWizardStore) addShapeWizardStore: AddShapeWizardStore;
    @Inject(MultilingualStore) multilingualStore: MultilingualStore;
    @Inject(ShapeTemplateStore) shapeTemplateStore: ShapeTemplateStore;
    @Localize(ProcessDesignerLocalization.namespace) pdLoc: ProcessDesignerLocalization.locInterface;
    @Localize(OPMCoreLocalization.namespace) opmCoreloc: OPMCoreLocalization.locInterface;
    @Localize(OmniaUxLocalizationNamespace) omniaLoc: OmniaUxLocalization;

    private subscriptionHandler: IMessageBusSubscriptionHandler = null;
    private selectedShapeDefinition: DrawingShapeDefinition = null;//ToDo check other type?
    private isLoading: boolean = true;
    private internalValidator: IValidator = null;
    private isCreatingChildStep: boolean = false;
    private drawingShapeOptions: DrawingShapeOptions = null;
    private errorMessage: string = "";

    created() {
        this.init();
    }

    mounted() {
        WebComponentBootstrapper.registerElementInstance(this, this.$el);

    }

    init() {
        this.internalValidator = new FormValidator();
        this.selectedShapeDefinition = Utils.clone(this.addShapeWizardStore.selectedShape.state);
        this.drawingShapeOptions = {
            processStepId: Guid.empty,
            shapeDefinition: this.selectedShapeDefinition,
            shapeType: DrawingShapeTypes.ProcessStep,
            title: null
        };
        var foundTemplate = this.shapeTemplateStore.getters.shapeTemplates().find(t => t.id.toString() == this.selectedShapeDefinition.shapeTemplateId.toString());
        if (!foundTemplate.builtIn && foundTemplate.settings.type == ShapeTemplateType.FreeformShape) {
            this.drawingShapeOptions.shape = {
                nodes: (this.selectedShapeDefinition as DrawingFreeformShapeDefinition).nodes,
                definition: this.selectedShapeDefinition,
                shapeTemplateTypeName: ShapeTemplateType[this.selectedShapeDefinition.shapeTemplateType],
                left: null,
                top: null
            }
        }
        if (!foundTemplate.builtIn && foundTemplate.settings.type == ShapeTemplateType.MediaShape) {
            this.imageService.copyImageFromTemplate(this.currentProcessStore.getters.referenceData().process, foundTemplate.id).then((imageUrl) => {
                (this.drawingShapeOptions.shapeDefinition as DrawingImageShapeDefinition).imageUrl = imageUrl;
                this.isLoading = false;
            })
        }
        else this.isLoading = false;
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
        this.errorMessage = "";
        if (this.internalValidator.validateAll()) {
            let readyToDrawShape: boolean = true;

            if (this.drawingShapeOptions.shapeType == DrawingShapeTypes.ProcessStep) {
                if (this.drawingShapeOptions.processStepId == Guid.empty) {
                    readyToDrawShape = false;
                    this.isCreatingChildStep = true;
                    this.currentProcessStore.actions.addProcessStep.dispatch(this.drawingShapeOptions.title).then((result) => {
                        this.isCreatingChildStep = false;
                        this.drawingShapeOptions.processStepId = result.processStep.id;
                        this.completedAddShape();
                    }).catch((err) => {
                        this.isCreatingChildStep = false;
                        this.errorMessage = err || "";
                    });
                }
            }
            else if (this.drawingShapeOptions.shapeType == DrawingShapeTypes.ExternalProcessStep) {
                if (this.drawingShapeOptions.externalProcesStepId == Guid.empty) {
                    readyToDrawShape = false;
                    if (this.drawingShapeOptions.linkedRootProcessStepId) {
                        this.isCreatingChildStep = true;
                        this.currentProcessStore.actions.addExtenalProcessStep.dispatch(this.drawingShapeOptions.title, this.drawingShapeOptions.linkedRootProcessStepId).then((result) => {
                            this.isCreatingChildStep = false;
                            this.drawingShapeOptions.externalProcesStepId = result.processStep.id;
                            this.completedAddShape();
                        }).catch((err) => {
                            this.isCreatingChildStep = false;
                            this.errorMessage = err || "";
                        });
                    }
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
        let readyForSave = this.drawingShapeOptions ? true : false;
        return (
            <v-card-actions>
                <v-btn text
                    color={this.omniaTheming.themes.primary.base}
                    dark={this.omniaTheming.promoted.body.dark}
                    onClick={this.changeShape}>{this.pdLoc.ChangeShape}</v-btn>
                <v-spacer></v-spacer>
                <v-btn text
                    disabled={!readyForSave}
                    color={this.omniaTheming.themes.primary.base}
                    dark={this.omniaTheming.promoted.body.dark}
                    loading={this.isCreatingChildStep}
                    onClick={this.createShape}>{this.omniaLoc.Common.Buttons.Ok}</v-btn>
                <v-btn text
                    onClick={this.onClose}>{this.omniaLoc.Common.Buttons.Cancel}</v-btn>
            </v-card-actions>
        )
    }
    /**
        * Render 
        * @param h
        */
    render(h) {
        return <v-card flat>
            <v-card-content>
                <span style={{ color: 'red' }}>{this.errorMessage}</span>
                {
                    this.isLoading ?
                        <v-skeleton-loader loading={true} height="100%" type="table-tbody"></v-skeleton-loader>
                        :
                        <ShapeTypeComponent
                            drawingOptions={this.drawingShapeOptions}
                            changeDrawingOptionsCallback={this.onChangedDrawingOptions}
                            changeShapeCallback={this.changeShape}
                            useValidator={this.internalValidator}
                        ></ShapeTypeComponent>
                }
            </v-card-content>
            {this.renderActionButtons(h)}
        </v-card>;
    }
}


WebComponentBootstrapper.registerElement((manifest) => {
    vueCustomElement(manifest.elementName, ShapeTypeStepComponent, { destroyTimeout: 1500 });
});
