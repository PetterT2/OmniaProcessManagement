import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { vueCustomElement, IWebComponentInstance, WebComponentBootstrapper, Inject, Localize } from "@omnia/fx";
import './FreeFormDrawing.css';
import { StyleFlow, VueComponentBase, OmniaTheming, DialogModel, DialogPositions, OmniaUxLocalizationNamespace, OmniaUxLocalization } from '@omnia/fx/ux';
import { FreeFormDrawingStyles } from '../../models';
import { IFreeFormDrawing } from './IFreeFormDrawing';
import { CanvasDefinition, DrawingShapeDefinition } from '../../fx/models';
import { DrawingCanvas, DrawingCanvasFreeForm, IShape, FreeformShape } from '../../fx';
import { Guid } from '@omnia/fx-models';
import { FreeFormDrawingLocalization } from './loc/localize';

@Component
export default class FreeFormDrawingComponent extends VueComponentBase implements IWebComponentInstance, IFreeFormDrawing {
    @Prop() styles: typeof FreeFormDrawingStyles | any;
    @Prop() shapeDefinition: DrawingShapeDefinition;
    @Prop() onClosed?: () => void;
    @Prop() onSaved: (shape: IShape) => void;

    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Localize(FreeFormDrawingLocalization.namespace) loc: FreeFormDrawingLocalization.locInterface;
    @Localize(OmniaUxLocalizationNamespace) omniaUxLoc: OmniaUxLocalization;

    private dialogModel: DialogModel = { visible: false };
    private classes = StyleFlow.use(FreeFormDrawingStyles, this.styles);
    private canvasId: string = 'opmcanvas' + Guid.newGuid().toString();
    private drawingCanvas: DrawingCanvasFreeForm;
    private canvasDefinition: CanvasDefinition = {
        width: 800,
        height: 600,
        gridX: 50,
        gridY: 50,
        drawingShapes: []
    };

    created() {

    }

    mounted() {
        WebComponentBootstrapper.registerElementInstance(this, this.$el);
        this.dialogModel.visible = true;
        this.init();
    }

    private init() {
        setTimeout(() => {
            this.drawingCanvas = new DrawingCanvasFreeForm(this.canvasId, {}, this.canvasDefinition);
            this.drawingCanvas.start(this.shapeDefinition);
        }, 0);
    }

    private addNewFreeFormDrawing() {
        if (this.drawingCanvas.drawingShapes.length > 0)
            this.onSaved((this.drawingCanvas.drawingShapes[0].shape as FreeformShape).getShapeJson());
        this.onInternalClosed();
    }

    onInternalClosed() {
        this.dialogModel.visible = false;
        if (this.onClosed) {
            this.onClosed();
        }
    }

    render(h) {
        return (
            <omfx-dialog dark={this.omniaTheming.promoted.body.dark}
                contentClass={this.omniaTheming.promoted.body.class}
                onClose={() => { this.onInternalClosed(); }}
                model={this.dialogModel}
                hideCloseButton
                width="800px"
                position={DialogPositions.Center}>
                <div>
                    <v-toolbar flat dark={this.omniaTheming.promoted.header.dark} color={this.omniaTheming.themes.primary.base}>
                        <v-toolbar-title>{this.loc.NewFreeFormShape}</v-toolbar-title>
                        <v-spacer></v-spacer>
                        <v-btn icon onClick={() => { this.onInternalClosed(); }}>
                            <v-icon>close</v-icon>
                        </v-btn>
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
                                dark={this.omniaTheming.promoted.body.dark}
                                color={this.omniaTheming.themes.primary.base}
                                onClick={() => { this.addNewFreeFormDrawing(); }}>
                                {this.omniaUxLoc.Common.Buttons.Create}
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
        )
    }
}

WebComponentBootstrapper.registerElement((manifest) => {
    vueCustomElement(manifest.elementName, FreeFormDrawingComponent);
});
