import { Inject, Localize, WebComponentBootstrapper, vueCustomElement } from '@omnia/fx';

import Component from 'vue-class-component';
import 'vue-tsx-support/enable-check';
import { Guid, IMessageBusSubscriptionHandler } from '@omnia/fx-models';
import { OmniaTheming, VueComponentBase, StyleFlow, MediaPickerProvider, MediaPickerProviderMediaTypes, DialogPositions, MediaPickerImageTransformerProviderResult, OmniaUxLocalizationNamespace, OmniaUxLocalization } from '@omnia/fx/ux';
import { Prop } from 'vue-property-decorator';
import { CurrentProcessStore, ProcessTypeStore, ProcessTemplateStore, DrawingCanvas } from '../../../../fx';
import { ProcessDesignerStore } from '../../../stores';
import { ProcessDesignerLocalization } from '../../../loc/localize';
import './AddShape.css';
import { ShapeDefinition, DrawingShapeDefinition, DrawingShapeTypes } from '../../../../fx/models';
import { ShapeDefinitionSelection } from '../../../../models/processdesigner';
import { setTimeout } from 'timers';

export interface ShapeSelectionStepProps {
}

@Component
export class ShapeSelectionStepComponent extends VueComponentBase<ShapeSelectionStepProps, {}, {}>{
    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Inject(CurrentProcessStore) currentProcessStore: CurrentProcessStore;
    @Inject(ProcessDesignerStore) processDesignerStore: ProcessDesignerStore;
    @Inject(ProcessTypeStore) processTypeStore: ProcessTypeStore;
    @Inject(ProcessTemplateStore) processTemplateStore: ProcessTemplateStore;
    @Localize(ProcessDesignerLocalization.namespace) pdLoc: ProcessDesignerLocalization.locInterface;
    @Localize(OmniaUxLocalizationNamespace) omniaLoc: OmniaUxLocalization;

    private subscriptionHandler: IMessageBusSubscriptionHandler = null;
    private openedImageDialog: boolean = false;
    //canvasSettingsStyles = StyleFlow.use(DrawingCanvasSettingsStyles);
    private availableShapeDefinitions: Array<ShapeDefinitionSelection> = null;
    private drawingCanvas: { [id: string]: DrawingCanvas } = {};
    private shapeFilterKeyword: string = '';

    created() {
        this.init();
    }

    init() {
        let processTemplateId = this.processDesignerStore.rootProcessReferenceData.currentProcessStep.processTemplateId;
        this.processTemplateStore.actions.ensureLoadProcessTemplate.dispatch(processTemplateId).then((loadedProcessTemplate) => {
            this.availableShapeDefinitions = loadedProcessTemplate.settings.shapeDefinitions;
            if (this.availableShapeDefinitions) {
                this.availableShapeDefinitions.forEach((item) => {
                    item.id = Guid.newGuid()
                });
                this.startToDrawShape();
            }
        });
    }

    //get editingCanvasDefinition() {
    //    let result: CanvasDefinition = null;
    //    if (this.processDesignerStore.editingProcessReference.state) {
    //        result = this.processDesignerStore.editingProcessReference.state.;
    //    }
    //    return result;
    //}

    mounted() {
        WebComponentBootstrapper.registerElementInstance(this, this.$el);
    }

    beforeDestroy() {
        if (this.subscriptionHandler)
            this.subscriptionHandler.unsubscribe();
        if (this.drawingCanvas) {
            for (var key in this.drawingCanvas) {
                if (this.drawingCanvas[key])
                    this.drawingCanvas[key].destroy();
            }
        }
    }

    private onClose() {
        this.processDesignerStore.panels.mutations.toggleAddShapePanel.commit(false);
    }

    private renderCurrentStep(h) {
    }
    private renderActionButtons(h) {
        return <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
                color={this.omniaTheming.themes.primary.base}
                onClick={this.onClose}>{this.omniaLoc.Common.Buttons.Close}</v-btn>
        </v-card-actions>;
    }

    private renderRecentShapeSelections(h) {
        if (!this.availableShapeDefinitions)
            return null;

            //todo
    }

    private onFilterShapeDefinition() {
        var kw = this.shapeFilterKeyword ? this.shapeFilterKeyword.toLowerCase() : '';
        this.availableShapeDefinitions.forEach((item) => {
            if (kw.length == 0)
                item.visible = true;
            else {
                if (item.multilingualTitle.toLowerCase().indexOf(kw) >= 0) {
                    item.visible = true;
                }
                else {
                    item.visible = false;
                }
            }
        });
    }
    private selectShape(shapeDefinition: ShapeDefinitionSelection) {
        this.availableShapeDefinitions.forEach((item) => {
            item.isSelected = false;
        });
        shapeDefinition.isSelected = true;

        //todo: added to recent
    }

    renderShapeSelections(h) {
        if (!this.availableShapeDefinitions)
            return null;

        return <div>
            <v-text-field label={this.pdLoc.Search} v-model={this.shapeFilterKeyword} onChange={this.onFilterShapeDefinition}></v-text-field>
            {this.renderShapeCanvasElements(h)}
        </div>;
    }

    renderShapeCanvasElements(h) {
        return <div>
            {
                this.availableShapeDefinitions.map((df) => {
                    return <div id={'canvaswrapper_' + df.id.toString()} class={[df.isSelected ? 'selected' : '']} v-show={df.visible} onClick={() => { this.selectShape(df) }}> <canvas id={df.id.toString()}></canvas></div>
                })
            }
        </div>;
    }

    startToDrawShape() {
        if (this.availableShapeDefinitions) {
            setTimeout(() => {
                this.availableShapeDefinitions.forEach((df) => {
                    if (!this.drawingCanvas[df.id.toString()]) {
                        this.drawingCanvas[df.id.toString()] = new DrawingCanvas(df.id.toString(), {},
                            {
                                drawingShapes: [],
                                width: 100,
                                height: 100
                            });
                        this.drawingCanvas[df.id.toString()].addShape(Guid.newGuid(), DrawingShapeTypes.Undefined, (df as DrawingShapeDefinition), null, false, 0, 0);
                    }
                });
               
            }, 200);
        }
    }

    /**
        * Render 
        * @param h
        */
    render(h) {
        return <div>
            {this.renderRecentShapeSelections(h)}
            {this.renderShapeSelections(h)}
        </div>;
    }
}


WebComponentBootstrapper.registerElement((manifest) => {
    vueCustomElement(manifest.elementName, ShapeSelectionStepComponent);
});
