import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { Inject, Localize, Utils } from "@omnia/fx";
import { StyleFlow, VueComponentBase, OmniaTheming, DialogModel, DialogPositions, OmniaUxLocalizationNamespace, OmniaUxLocalization } from '@omnia/fx/ux';
import { CanvasDefinition, DrawingShapeDefinition, DrawingShape, ShapeSelectionStyles, ICanvasDefinition } from '../../../fx/models';
import { ProcessDesignerLocalization } from '../../loc/localize';
import { DrawingCanvasFreeForm, CurrentProcessStore, OPMUtils, ProcessStore, IShape, Shape } from '../../../fx';
import { Guid } from '@omnia/fx-models';
import { setTimeout } from 'timers';
import { ProcessDesignerStore } from '../../stores';

interface FreeformPickerComponentProps {
    shapeDefinition: DrawingShapeDefinition;
    closed: () => void;
    save: (shape: IShape) => void;
    canvasDefinition: CanvasDefinition;
}

@Component
export class FreeformPickerComponent extends VueComponentBase<FreeformPickerComponentProps> {
    @Prop() shapeDefinition: DrawingShapeDefinition;
    @Prop() closed: () => void;
    @Prop() save: (shape: IShape) => void;
    @Prop() canvasDefinition: CanvasDefinition;

    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Inject(CurrentProcessStore) currentProcessStore: CurrentProcessStore;
    @Inject(ProcessDesignerStore) processDesignerStore: ProcessDesignerStore;

    @Localize(ProcessDesignerLocalization.namespace) loc: ProcessDesignerLocalization.locInterface;
    @Localize(OmniaUxLocalizationNamespace) omniaUxLoc: OmniaUxLocalization;

    private dialogModel: DialogModel = { visible: false };
    private classes = StyleFlow.use(ShapeSelectionStyles);
    private canvasId: string = 'opmcanvas' + Guid.newGuid().toString();
    private drawingCanvas: DrawingCanvasFreeForm;
    private isFinished: boolean = false;

    created() {
        this.dialogModel.visible = true;
    }

    mounted() {
        this.init();
    }

    init() {
        this.initFreeFormCanvas();
    }

    initFreeFormCanvas() {
        if (this.drawingCanvas)
            this.drawingCanvas.destroy();
        setTimeout(() => {
            this.drawingCanvas = new DrawingCanvasFreeForm(this.canvasId.toString(), {},
                this.canvasDefinition, true, null, null, this.processDesignerStore.showGridlines.state);
            (this.drawingCanvas as DrawingCanvasFreeForm).setSelectingShapeCallback((selectedShape) => {
                this.isFinished = selectedShape != null;
                if (this.isFinished)
                    this.drawingCanvas.stop();
            });
            (this.drawingCanvas as DrawingCanvasFreeForm).start(this.shapeDefinition, "");
        }, 0)
    }

    private addNewFreeformPicker() {
        this.dialogModel.visible = false;
        if (this.drawingCanvas.drawingShapes.length > 0) {
            let shape = (this.drawingCanvas.drawingShapes[0].shape as Shape).getShapeJson();
            this.save(shape);
        }
    }

    onInternalClosed() {
        this.dialogModel.visible = false;
        this.closed();
    }

    render(h) {
        return (
            <div>
                <omfx-dialog dark={this.omniaTheming.promoted.body.dark}
                    contentClass={this.omniaTheming.promoted.body.class}
                    model={this.dialogModel}
                    hideCloseButton
                    maxWidth="1200px"
                    width={this.canvasDefinition ? this.canvasDefinition.width + 'px' : "800px"}
                    position={DialogPositions.Center}>
                    <div>
                        <v-toolbar flat dark={this.omniaTheming.promoted.header.dark} color={this.omniaTheming.themes.primary.base}>
                            <v-toolbar-title>{this.loc.DrawFreeform}</v-toolbar-title>
                            <v-spacer></v-spacer>
                        </v-toolbar>
                        <v-divider></v-divider>
                        <v-card flat tile class={this.omniaTheming.promoted.body.class}>
                            <div data-omfx class={this.classes.centerDialogBody}>
                                <div class={this.classes.wrapper}>
                                    <canvas id={this.canvasId} width="800px" height="600px"></canvas>
                                </div>
                            </div>
                            <v-card-actions class={this.classes.dialogFooter}>
                                <v-spacer></v-spacer>
                                <v-btn
                                    text
                                    class="pull-right"
                                    disabled={!this.isFinished}
                                    dark={this.omniaTheming.promoted.body.dark}
                                    color={this.omniaTheming.themes.primary.base}
                                    onClick={() => { this.addNewFreeformPicker(); }}>
                                    {this.omniaUxLoc.Common.Buttons.Ok}
                                </v-btn>
                                <v-btn
                                    text
                                    class="pull-right"
                                    light={!this.omniaTheming.promoted.body.dark}
                                    onClick={() => { this.onInternalClosed(); }}>
                                    {this.omniaUxLoc.Common.Buttons.Cancel}
                                </v-btn>
                            </v-card-actions>
                        </v-card>
                    </div>
                </omfx-dialog>
            </div>
        )
    }
}

