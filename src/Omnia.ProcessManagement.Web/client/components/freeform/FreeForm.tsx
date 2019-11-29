import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { vueCustomElement, IWebComponentInstance, WebComponentBootstrapper, Inject, Localize } from "@omnia/fx";
import './FreeForm.css';
import { StyleFlow, VueComponentBase, OmniaTheming, DialogModel, DialogPositions, OmniaUxLocalizationNamespace, OmniaUxLocalization } from '@omnia/fx/ux';
import { FreeFormStyles } from '../../models';
import { IFreeForm } from './IFreeForm';
import { CanvasDefinition, ICanvasDefinition, DrawingShapeTypes, TextPosition, DrawingShapeDefinition } from '../../fx/models';
import { DrawingCanvas, DrawingCanvasFreeForm } from '../../fx';
import { Guid } from '@omnia/fx-models';
import { FreeFormLocalization } from './loc/localize';

@Component
export default class FreeFormComponent extends VueComponentBase implements IWebComponentInstance {
    @Prop() styles: typeof FreeFormStyles | any;
    @Prop() shapeDefinition: DrawingShapeDefinition;
    @Prop() onClosed?: () => void;
    @Prop() onSaved: () => void;

    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Localize(FreeFormLocalization.namespace) loc: FreeFormLocalization.locInterface;
    @Localize(OmniaUxLocalizationNamespace) omniaUxLoc: OmniaUxLocalization;

    private dialogModel: DialogModel = { visible: false };
    private classes = StyleFlow.use(FreeFormStyles, this.styles);
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

    private addNewFreeForm() {

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
                                onClick={() => { this.addNewFreeForm(); }}>
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
    vueCustomElement(manifest.elementName, FreeFormComponent);
});
