import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop, Watch, Emit } from 'vue-property-decorator'
import { Inject, Localize, WebComponentBootstrapper, IWebComponentInstance, vueCustomElement, Utils, OmniaContext } from '@omnia/fx';
import { Guid } from '@omnia/fx-models';
import { StyleFlow, DialogModel, VueComponentBase, DialogPositions, OmniaTheming, OmniaUxLocalizationNamespace, OmniaUxLocalization } from "@omnia/fx/ux";
import { CurrentProcessStore, ShapeObject, DrawingCanvasFreeForm, Shape } from '../../fx';
import { DrawingShapeDefinition, CanvasDefinition, VDialogScrollableDialogStyles } from '../../fx/models';
import { ProcessDesignerStore } from '../../processdesigner/stores';
import { OPMCoreLocalization } from '../../core/loc/localize';
import '../../core/styles/dialog/VDialogScrollableDialogStyles.css';

@Component
export class FreeformPickerComponent extends VueComponentBase implements IWebComponentInstance {
    @Prop() shapeDefinition: DrawingShapeDefinition;
    @Prop() closed: () => void;
    @Prop() save: (shape: ShapeObject) => void;
    @Prop() canvasDefinition: CanvasDefinition;

    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Inject(CurrentProcessStore) currentProcessStore: CurrentProcessStore;
    @Inject(ProcessDesignerStore) processDesignerStore: ProcessDesignerStore;

    @Localize(OPMCoreLocalization.namespace) coreLoc: OPMCoreLocalization.locInterface;
    @Localize(OmniaUxLocalizationNamespace) omniaUxLoc: OmniaUxLocalization;

    private dialogModel: DialogModel = { visible: false };
    private canvasId: string = 'opmcanvas' + Guid.newGuid().toString();
    private drawingCanvas: DrawingCanvasFreeForm;
    private isFinished: boolean = false;
    private myVDialogCommonStyles = StyleFlow.use(VDialogScrollableDialogStyles);
    
    //private dialogLeftRightPadding = 30 * 2;
    private contentPadding = 27 * 2;

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
                this.canvasDefinition, true, null, null, true, this.processDesignerStore.getters.darkHightlight());
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
            shape.nodes[0].properties['stroke'] = this.shapeDefinition.borderColor;
            this.save(shape);
        }
    }

    onInternalClosed() {
        this.dialogModel.visible = false;
        this.closed();
    }

    render(h) {
        let dialogWidth = ((this.canvasDefinition ? this.canvasDefinition.width : 800) + this.contentPadding) + 'px';

        return (
            <v-dialog
                v-model={this.dialogModel}
                width={dialogWidth}
                scrollable
                persistent
                dark={this.theming.body.bg.dark}>
                <v-card class={[this.theming.body.bg.css, 'v-application']} data-omfx>
                    <v-card-title
                        class={[this.theming.chrome.bg.css, this.theming.chrome.text.css, this.myVDialogCommonStyles.dialogTitle]}
                        dark={this.theming.chrome.bg.dark}>
                        <div>{this.coreLoc.Buttons.DrawFreeform}</div>
                        <v-spacer></v-spacer>
                        <v-btn
                            icon
                            dark={this.theming.chrome.bg.dark}
                            onClick={this.onInternalClosed}>
                            <v-icon>close</v-icon>
                        </v-btn>
                    </v-card-title>
                    <v-card-text class={[this.theming.body.text.css, this.myVDialogCommonStyles.dialogMainContent]}>
                        <canvas id={this.canvasId} width="800px" height="600px"></canvas>
                    </v-card-text>
                    <v-card-actions>
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
            </v-dialog>
        )
    }
}

WebComponentBootstrapper.registerElement((manifest) => {
    vueCustomElement(manifest.elementName, FreeformPickerComponent);
});