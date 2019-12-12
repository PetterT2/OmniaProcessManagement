import { Inject, Localize, Topics, Utils, OmniaContext } from '@omnia/fx';

import Component from 'vue-class-component';
import 'vue-tsx-support/enable-check';
import { Guid, IMessageBusSubscriptionHandler } from '@omnia/fx-models';
import { CurrentProcessStore, DrawingCanvasEditor, ShapeTemplatesConstants, DrawingCanvas } from '../../../fx';
import { OmniaTheming, VueComponentBase, StyleFlow, DialogPositions, DialogModel } from '@omnia/fx/ux';
import { DrawingShapeTypes, DrawingShapeDefinition, TextPosition, ProcessData, CanvasDefinition } from '../../../fx/models';
import './ProcessStepDrawing.css';
import { ProcessStepDrawingStyles } from '../../../fx/models';
import { ProcessDesignerStore } from '../../stores';
import { TabRenderer } from '../../core';
import { component } from 'vue-tsx-support';
import { setTimeout } from 'timers';
import { Watch } from 'vue-property-decorator';
import { InternalOPMTopics } from '../../../core/messaging/InternalOPMTopics';
import { ProcessDesignerLocalization } from '../../loc/localize';
import { AddShapeOptions } from '../../../models/processdesigner';

export class ProcessStepDrawingTabRenderer extends TabRenderer {
    generateElement(h): JSX.Element {
        return (<ProcessStepDrawingComponent key={Guid.newGuid().toString()}></ProcessStepDrawingComponent>);
    }
}

export interface ProcessDrawingProps {
}

@Component
export class ProcessStepDrawingComponent extends VueComponentBase<ProcessDrawingProps, {}, {}>{
    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Inject(CurrentProcessStore) currentProcessStore: CurrentProcessStore;
    @Inject(ProcessDesignerStore) processDesignerStore: ProcessDesignerStore;
    @Localize(ProcessDesignerLocalization.namespace) pdLoc: ProcessDesignerLocalization.locInterface;

    private subscriptionHandler: IMessageBusSubscriptionHandler = null;
    private drawingCanvas: DrawingCanvas = null;
    processStepDrawingStyles = StyleFlow.use(ProcessStepDrawingStyles);
    private canvasId = 'editingcanvas_' + Utils.generateGuid().toString();

    created() {
        this.subscriptionHandler = InternalOPMTopics.onEditingCanvasDefinitionChange.subscribe(this.onCanvasDefinitionChanged);
    }

    mounted() {
        this.init();
    }

    beforeDestroy() {
        if (this.subscriptionHandler)
            this.subscriptionHandler.unsubscribe();
        if (this.drawingCanvas) {
            this.drawingCanvas.destroy();
        }
    }

    init() {
        this.initDrawingCanvas();
        this.processDesignerStore.mutations.addShapeToDrawing.onCommited((addShapeOptions: AddShapeOptions) => {
            this.drawingCanvas.addShape(Guid.newGuid(), addShapeOptions.shapeType, addShapeOptions.shapeDefinition, addShapeOptions.title, false, 0, 0, addShapeOptions.processStepId, addShapeOptions.customLink);
            //this.currentProcessStore.actions.saveState.dispatch();
        });
    }

    private onCanvasDefinitionChanged() {
        if (this.drawingCanvas) {
            this.drawingCanvas.destroy();
        }
        this.initDrawingCanvas();
    }

    get editingProcessStepCanvasDefinition() {
        let result: CanvasDefinition = this.currentProcessStore.getters.referenceData().current.processData.canvasDefinition;
        return result;
    }

    private initDrawingCanvas() {        
        let canvasDefinition = this.editingProcessStepCanvasDefinition;
        if (canvasDefinition) {
            //note: need to render the canvas div element before init this DrawingCanvasEditor
            this.drawingCanvas = new DrawingCanvasEditor(this.canvasId, {}, canvasDefinition);

            console.log('render canvas area');

            var myfirstShape: DrawingShapeDefinition = {
                activeBackgroundColor: 'red',
                backgroundColor: 'blue',
                borderColor: '',
                fontSize: 15,
                textColor: 'white',
                width: 100,
                height: 100,
                textPosition: TextPosition.Center,
            } as DrawingShapeDefinition;

            myfirstShape.shapeTemplate = ShapeTemplatesConstants.Circle;

            //this.drawingCanvas.addShape(Guid.newGuid(), DrawingShapeTypes.Undefined, myfirstShape, { isMultilingualString: true, "en-us": "Circle", "sv-se": "Circle" }, false, 100, 100);
        }
    }

    private renderPanels(h) {
        let components: Array<JSX.Element> = [];
        /* Right panel drawer */
        let backgroundColor = this.omniaTheming.promoted.body.background.base;
        if (this.omniaTheming.promoted.body.dark) {//todo
            //backgroundColor = this.editorStore.canvas.selectedLayoutItem.state
            //    && this.editorStore.canvas.selectedLayoutItem.state.itemtype === LayoutItemType.section ?
            //    backgroundColor = this.omniaTheming.promoted.body.secondary.base :
            //    backgroundColor = this.omniaTheming.promoted.body.primary.base
        }
        components.push(
            <v-navigation-drawer
                app
                float
                right
                clipped
                dark={this.omniaTheming.promoted.body.dark}
                width="400"
                temporary={false}
                disable-resize-watcher
                hide-overlay
                class={this.processStepDrawingStyles.settingsPanel(backgroundColor)}
                v-model={this.processDesignerStore.panels.drawingCanvasSettingsPanel.state.show}>
                {this.processDesignerStore.panels.drawingCanvasSettingsPanel.state.show ? <opm-processdesigner-drawingcanvas-settings></opm-processdesigner-drawingcanvas-settings> : null}
            </v-navigation-drawer>            
        );
        components.push(this.renderAddShapePanel(h));
        return components;
    }

    private renderAddShapePanel(h) {
        if (!this.processDesignerStore.panels.addShapePanel.state.show) {
            return null;
        }
        else {
            return <omfx-dialog
                onClose={this.closeAddShapePanel}
                model={{ visible: true }}
                maxWidth="800px"
                hideCloseButton={false}
                dark={this.omniaTheming.promoted.header.dark}
                contentClass={this.omniaTheming.promoted.body.class}
                position={DialogPositions.Center}
            >
                <div style={{ height: '100%' }}>
                    <opm-processdesigner-addshape-wizard></opm-processdesigner-addshape-wizard>
                </div>
            </omfx-dialog>;            
        }
    }
    private closeAddShapePanel() {
        this.processDesignerStore.panels.mutations.toggleAddShapePanel.commit(false);
    }

    private renderCanvasToolbar(h) {
        return <div class={this.processStepDrawingStyles.canvasToolbar(this.omniaTheming)}>
            <v-btn
                small
                icon
                onClick={this.showCanvasSettings}>
                <v-icon small color={this.omniaTheming.system.grey.lighten5}>settings</v-icon>
            </v-btn>
        </div>;
    }
     
    private showCanvasSettings() {
        this.processDesignerStore.panels.mutations.toggleDrawingCanvasSettingsPanel.commit(true);
    }

    /**
        * Render 
        * @param h
        */
    render(h) {
        let canvasDefinition = this.editingProcessStepCanvasDefinition;
        return (<v-card tile dark={this.omniaTheming.promoted.body.dark} color={this.omniaTheming.promoted.body.background.base} >
            <v-card-text>
                <div class={this.processStepDrawingStyles.canvasWrapper(this.omniaTheming)} style={{ width: canvasDefinition ? canvasDefinition.width + 'px' : 'auto' }}>
                    <div class={this.processStepDrawingStyles.canvasOverflowWrapper}>
                        <canvas id={this.canvasId}></canvas>
                    </div>
                    {this.renderCanvasToolbar(h)}
                </div>
                {this.renderPanels(h)}
            </v-card-text>
        </v-card>)
    }
}

