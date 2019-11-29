import { Inject, Localize, Topics, Utils, OmniaContext } from '@omnia/fx';

import Component from 'vue-class-component';
import 'vue-tsx-support/enable-check';
import { Guid, IMessageBusSubscriptionHandler } from '@omnia/fx-models';
import { CurrentProcessStore, DrawingCanvasEditor, ShapeTemplatesConstants, DrawingCanvas } from '../../../fx';
import { OmniaTheming, VueComponentBase } from '@omnia/fx/ux';
import { TabRenderer } from '..';
import { DrawingShapeTypes, DrawingShapeDefinition, TextPosition } from '../../../fx/models';

export class ProcessStepDrawingTabRenderer extends TabRenderer {
    generateElement(h): JSX.Element {
        return (<ProcessStepDrawingComponent key={Guid.newGuid().toString()}></ProcessStepDrawingComponent>);
    }
}

export interface ProcessDrawingProps {
}

@Component
export class ProcessStepDrawingComponent extends VueComponentBase<ProcessDrawingProps, {}, {}>{
    //@Prop() public callerEditorStore?: EditorStore;

    @Inject(OmniaTheming) omniaTheming: OmniaTheming;
    @Inject(CurrentProcessStore) currentProcessStore: CurrentProcessStore;

    private subscriptionHandler: IMessageBusSubscriptionHandler = null;
    private isEditMode: boolean = false;
    drawingCanvas: DrawingCanvas;

    created() {
        this.init();
        setTimeout(() => {
            this.testDrawing();
        }, 1000);
    }

    init() {
        //todo
        //if (this.callerEditorStore) {
        //    this.callerEditorStore = this.editorStore;
        //    this.callerEditorStore.mutations.initFormValidator.commit(this);
        //}
    }

    mounted() {
        //todo
        //this.$nextTick(function () {
        //    setTimeout(() => {
        //        if (this.editorStore.errorTabIndex.state > -1)
        //            this.editorStore.formValidator.validateAll();
        //    }, 1000);
        //});
    }

    beforeDestroy() {
        if (this.subscriptionHandler)
            this.subscriptionHandler.unsubscribe();
    }

    testDrawing() {
        var settings: DrawingShapeDefinition = {
            activeBackgroundColor: 'red',
            backgroundColor: 'blue',
            borderColor: '',
            fontSize: 15,
            textColor: 'white',
            width: 100,
            height: 100,
            textPosition: TextPosition.Center,
        } as DrawingShapeDefinition;
        
        this.drawingCanvas = new DrawingCanvasEditor('mycanvas', {}, {
            width: 600,
            height: 500,
            drawingShapes: [],
            gridX: 100,
            gridY: 100
        });
        settings.shapeTemplate = ShapeTemplatesConstants.Circle;
        this.drawingCanvas.addShape(Guid.newGuid(), DrawingShapeTypes.Undefined, settings, { isMultilingualString: true, "en-us": "Circle", "sv-se": "Circle" }, false, 100, 100);
    }

    /**
        * Render 
        * @param h
        */
    render(h) {
        return (<v-card tile dark={this.omniaTheming.promoted.body.dark} color={this.omniaTheming.promoted.body.background.base} >
            <v-card-text>
                <div>Drawing tab content</div>
                <div class="container">
                    <canvas id="mycanvas" width="600" height="500"></canvas>
                </div>
            </v-card-text>
        </v-card>)
    }
}

