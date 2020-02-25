import { Inject, Localize, Topics, Utils, OmniaContext } from '@omnia/fx';

import Component from 'vue-class-component';
import 'vue-tsx-support/enable-check';
import { Guid, IMessageBusSubscriptionHandler } from '@omnia/fx-models';
import { CurrentProcessStore, DrawingCanvasEditor, DrawingCanvas, ProcessDefaultData, OPMUtils } from '../../../fx';
import { OmniaTheming, VueComponentBase, StyleFlow, DialogPositions, ConfirmDialogDisplay, ConfirmDialogResponse } from '@omnia/fx/ux';
import { CanvasDefinition, DrawingShape, DrawingShapeTypes, ProcessStepDrawingShape } from '../../../fx/models';
import './ProcessStepDrawing.css';
import { ProcessStepDrawingStyles } from '../../../fx/models';
import { ProcessDesignerStore } from '../../stores';
import { TabRenderer } from '../../core';
import { setTimeout, setInterval } from 'timers';
import { ProcessDesignerLocalization } from '../../loc/localize';
import { DrawingShapeOptions } from '../../../models/processdesigner';
import { CopyToNewProcessDialog } from '../../copytonewprocess_dialog/CopyToNewProcess';

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
    private drawingCanvasEditor: DrawingCanvasEditor = null;
    private drawingParentCanvas: DrawingCanvas = null;
    private shapeSettingsPanelComponentKey = Utils.generateGuid();
    processStepDrawingStyles = StyleFlow.use(ProcessStepDrawingStyles);
    private canvasId = 'editingcanvas_' + Utils.generateGuid().toString();
    private parentCanvasId = 'parentcanvas_' + Utils.generateGuid().toString();

    created() {

    }

    mounted() {
        this.initDrawingCanvas();
        this.initSubscription();
    }

    beforeDestroy() {
        if (this.subscriptionHandler)
            this.subscriptionHandler.unsubscribe();

        if (this.drawingCanvasEditor) {
            this.drawingCanvasEditor.destroy();
        }

        if (this.drawingParentCanvas) {
            this.drawingParentCanvas.destroy();
        }
    }

    get canvasDefinition(): CanvasDefinition {
        let referenceData = this.currentProcessStore.getters.referenceData();
        if (referenceData && referenceData.current.processData)
            return referenceData.current.processData.canvasDefinition;
        return null;
    }

    get parentProcessData() {
        let referenceData = this.currentProcessStore.getters.referenceData();
        if (referenceData) 
            return referenceData.current.parentProcessData;
        return null;
    }

    initSubscription() {
        this.subscriptionHandler = this.processDesignerStore.mutations.updateCanvasSettings.onCommited((canvasDefinition) => {
            this.onCanvasDefinitionChanged();
        });

        this.subscriptionHandler.add(this.processDesignerStore.showGridlines.onMutated(() => {
            this.onCanvasDefinitionChanged(false);
        })
        );

        this.subscriptionHandler.add(this.processDesignerStore.highlightShapes.onMutated(() => {
            this.onCanvasDefinitionChanged(false);
        })
        );

        this.subscriptionHandler.add(this.processDesignerStore.highlightShapesWithDarkColor.onMutated(() => {
            this.onCanvasDefinitionChanged(false);
        })
        );

        this.subscriptionHandler.add(this.processDesignerStore.mutations.addShapeToDrawing.onCommited(this.onAddNewShape));
        this.subscriptionHandler.add(this.processDesignerStore.mutations.updateDrawingShape.onCommited(this.onEditedShape));
        this.subscriptionHandler.add(this.processDesignerStore.mutations.deleteSelectingDrawingShape.onCommited(this.onDeletedShape));
    }

    private onCanvasDefinitionChanged(saveState: boolean = true) {
        if (saveState) {
            this.saveState(false);
        }
        if (this.drawingCanvasEditor) {
            this.drawingCanvasEditor.destroy();
        }
        this.initDrawingCanvas();
    }

    private initDrawingCanvas() {
        if (this.canvasDefinition) {
            OPMUtils.waitForElementAvailable(this.$el, this.canvasId.toString(), () => {
                this.drawingCanvasEditor = new DrawingCanvasEditor(this.canvasId, {}, this.canvasDefinition, false,
                    this.onClickEditShape, this.onShapeChange, this.processDesignerStore.showGridlines.state, this.processDesignerStore.getters.darkHightlight());
                this.drawingCanvasEditor.setSelectingShapeCallback(this.onSelectingShape);
            });
        }
        else if (this.parentProcessData && this.parentProcessData.canvasDefinition) {
            OPMUtils.waitForElementAvailable(this.$el, this.parentCanvasId.toString(), () => {
                var cloneParentCavasDefinition: CanvasDefinition = JSON.parse(JSON.stringify(this.parentProcessData.canvasDefinition));
                var selectedShape: ProcessStepDrawingShape = cloneParentCavasDefinition.drawingShapes && cloneParentCavasDefinition.drawingShapes.length > 0 ?
                    cloneParentCavasDefinition.drawingShapes.find(s => s.type == DrawingShapeTypes.ProcessStep &&
                        (s as ProcessStepDrawingShape).processStepId &&
                        (s as ProcessStepDrawingShape).processStepId.toString() == this.currentProcessStore.getters.referenceData().current.processStep.id) as ProcessStepDrawingShape : null;

                this.drawingParentCanvas = new DrawingCanvas(this.parentCanvasId, {}, cloneParentCavasDefinition, false, this.processDesignerStore.showGridlines.state,
                    this.processDesignerStore.getters.darkHightlight());

                if (selectedShape) {
                    setTimeout(() => {
                        this.drawingParentCanvas.setSelectedShapeItemId(selectedShape.processStepId)
                    }, 20)
                }
            })
        }
    }

    private onAddNewShape(addShapeOptions: DrawingShapeOptions) {
        let left = 0; let top = 0;
        let nodes = null;
        if (addShapeOptions.shape) {
            left = addShapeOptions.shape.left;
            top = addShapeOptions.shape.top;
            nodes = addShapeOptions.shape.nodes;
        }
        this.drawingCanvasEditor.addShape(Guid.newGuid(), addShapeOptions.shapeType, addShapeOptions.shapeDefinition, addShapeOptions.title,
            left, top, addShapeOptions.processStepId, addShapeOptions.customLinkId, addShapeOptions.externalProcesStepId, nodes).then(() => { this.saveState(true); });
    }

    private onSelectingShape(shape: DrawingShape) {
        this.processDesignerStore.mutations.setSelectedShapeToEdit.commit(shape);
    }

    private onEditedShape(drawingOptions: DrawingShapeOptions) {
        let drawingShapeToUpdate = this.processDesignerStore.getters.shapeToEditSettings();
        this.drawingCanvasEditor.updateShape(drawingShapeToUpdate, drawingOptions).then(() => { this.saveState(true); });
    }

    private onDeletedShape() {
        if (this.processDesignerStore.getters.shapeToEditSettings() != null) {
            this.drawingCanvasEditor.deleteShape(this.processDesignerStore.getters.shapeToEditSettings());
            setTimeout(() => {
                this.saveState(true);
            }, 200);
        }
    }

    private onClickEditShape(selectedShape: DrawingShape) {
        this.processDesignerStore.mutations.setSelectedShapeToEdit.commit(selectedShape);
        this.processDesignerStore.panels.mutations.toggleEditShapeSettingsPanel.commit(true);
    }

    private onShapeChange(refreshSettingsPanel?: boolean) {
        this.saveState(true);

        if (refreshSettingsPanel) {
            this.shapeSettingsPanelComponentKey = Utils.generateGuid();
        }
    }

    private saveState(isShapeChanged: boolean = false) {
        if (isShapeChanged) {
            this.currentProcessStore.getters.referenceData().current.processData.canvasDefinition = this.drawingCanvasEditor.getCanvasDefinitionJson();
        }
        this.processDesignerStore.actions.saveState.dispatch();
    }

    private createDrawing() {
        this.currentProcessStore.getters.referenceData().current.processData.canvasDefinition = ProcessDefaultData.canvasDefinition;
        this.processDesignerStore.actions.saveState.dispatch();

        if (this.drawingParentCanvas) {
            this.drawingParentCanvas.destroy();
            this.drawingParentCanvas = null;
        }

        this.initDrawingCanvas();
    }

    private deleteDrawing() {
        this.$confirm.open().then(resposne => {
            if (resposne == ConfirmDialogResponse.Ok) {
                this.currentProcessStore.getters.referenceData().current.processData.canvasDefinition = null;
                this.processDesignerStore.actions.saveState.dispatch();
                if (this.drawingCanvasEditor) {
                    this.drawingCanvasEditor.destroy();
                    this.drawingCanvasEditor = null;
                }
                this.initDrawingCanvas();
            }
        })
    }

    private showCanvasSettings() {
        this.processDesignerStore.panels.mutations.toggleDrawingCanvasSettingsPanel.commit(true);
    }

    private deleteShape() {
        this.processDesignerStore.panels.mutations.hideAllPanels.commit();
        this.$confirm.open({ message: this.pdLoc.DeleteShapeConfirmMessage }).then((response) => {
            if (response === ConfirmDialogResponse.Ok) {
                this.processDesignerStore.mutations.deleteSelectingDrawingShape.commit();
            }
        });
    }

    /**
        * Render 
        * @param h
        */

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
        components.push(this.renderEditShapeSettingsPanel(h, backgroundColor));

        components.push(
            <v-navigation-drawer
                app
                float
                right
                clipped
                dark={this.omniaTheming.promoted.body.dark}
                width="340"
                temporary={false}
                disable-resize-watcher
                hide-overlay
                class={this.processStepDrawingStyles.settingsPanel(backgroundColor)}
                v-model={this.processDesignerStore.panels.changeProcessTypePanel.state.show}>
                {this.processDesignerStore.panels.changeProcessTypePanel.state.show ? <opm-process-changeprocesstype></opm-process-changeprocesstype> : null}
            </v-navigation-drawer >
        );

        components.push(<CopyToNewProcessDialog></CopyToNewProcessDialog>);

        return components;
    }

    private renderAddShapePanel(h) {
        if (!this.processDesignerStore.panels.addShapePanel.state.show) {
            return null;
        }
        else {
            return <omfx-dialog
                model={{ visible: true }}
                maxWidth="800px"
                hideCloseButton={true}
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
    private renderEditShapeSettingsPanel(h, backgroundColor: string) {
        return <v-navigation-drawer
            app
            float
            right
            clipped
            dark={this.omniaTheming.promoted.body.dark}
            width="700"
            temporary={false}
            disable-resize-watcher
            hide-overlay
            class={this.processStepDrawingStyles.settingsPanel(backgroundColor)}
            v-model={this.processDesignerStore.panels.editShapeSettingsPanel.state.show}>
            {this.processDesignerStore.panels.editShapeSettingsPanel.state.show ? <opm-processdesigner-shape-settings key={this.shapeSettingsPanelComponentKey}></opm-processdesigner-shape-settings> : null}
        </v-navigation-drawer>;
    }

    private renderCanvasToolbar(h) {
        return <div class={this.processStepDrawingStyles.canvasToolbar(this.omniaTheming)}>
            {
                this.canvasDefinition && this.parentProcessData &&
                <v-btn
                    small
                    icon
                    onClick={this.deleteDrawing}>
                    <v-icon small color={this.omniaTheming.system.grey.lighten5}>fal fa-trash-alt</v-icon>
                </v-btn>
            }
            <v-btn
                small
                icon
                onClick={this.showCanvasSettings}>
                <v-icon small color={this.omniaTheming.system.grey.lighten5}>settings</v-icon>
            </v-btn>
        </div>;
    }

    render(h) {
        var widthStr = this.canvasDefinition && this.canvasDefinition.width ? this.canvasDefinition.width + 'px' :
            (this.parentProcessData && this.parentProcessData.canvasDefinition && this.parentProcessData.canvasDefinition.width ? this.parentProcessData.canvasDefinition.width + 'px' : 'auto');

        return (
            <div>
                <v-card tile dark={this.omniaTheming.promoted.body.dark} color={this.omniaTheming.promoted.body.background.base} >
                    <v-card-text>
                        {
                            this.canvasDefinition ?
                                <div class="mb-3">
                                    <v-btn text onClick={() => {
                                        this.processDesignerStore.panels.mutations.toggleAddShapePanel.commit(true);
                                    }}>{this.pdLoc.AddShape}</v-btn>
                                    {
                                        this.processDesignerStore.getters.shapeToEditSettings() ?
                                            <v-btn text onClick={() => {
                                                this.deleteShape();
                                            }}>{this.pdLoc.DeleteShape}</v-btn>
                                            : null
                                    }
                                </div>
                                : null
                        }
                        <div class={this.processStepDrawingStyles.canvasWrapper(this.omniaTheming)} style={{ width: widthStr }}>
                            <div class={this.processStepDrawingStyles.canvasOverflowWrapper}>
                                {
                                    this.canvasDefinition ? <canvas id={this.canvasId}></canvas> :
                                        this.parentProcessData && this.parentProcessData.canvasDefinition ? <canvas id={this.parentCanvasId}></canvas> : null
                                }
                            </div>
                            {this.canvasDefinition && this.renderCanvasToolbar(h)}
                        </div>
                        {!this.canvasDefinition ?
                            <div class="mt-5">
                                <div style={{ color: 'black' }}>{this.pdLoc.NoDrawingMessage}</div>
                                <v-btn text
                                    color={this.omniaTheming.themes.primary.base}
                                    dark={this.omniaTheming.promoted.body.dark}
                                    onClick={this.createDrawing}>{this.pdLoc.CreateDrawing}</v-btn>
                            </div> : null
                        }

                    </v-card-text>
                </v-card>
                {this.renderPanels(h)}
            </div>
        )
    }
}

