

import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { fabric } from 'fabric';
import { IWebComponentInstance, WebComponentBootstrapper, vueCustomElement, Inject } from '@omnia/fx';
//import FabricTextShape from '../fx/models/processshape/fabricshape/FabricTextShape';
import { ShapeTemplatesConstants, CircleShape, DrawingCanvasEditor, DrawingCanvas } from '../fx';
import { Guid } from '@omnia/fx-models';
import { DrawingShapeTypes } from '../fx/models/data/drawingdefinitions';
import { MultilingualStore } from '@omnia/fx/store';
import { DrawingShapeDefinition, TextPosition } from '../fx/models';


@Component
export class FabricPlayComponent extends Vue implements IWebComponentInstance {
    @Inject(MultilingualStore) private multilingualStore: MultilingualStore;

    canvas: fabric.Canvas;
    testShape: CircleShape;
    drawingCanvas1: DrawingCanvas;
    openFreeForm: boolean = false;
    // -------------------------------------------------------------------------
    // Services
    // -------------------------------------------------------------------------


    // -------------------------------------------------------------------------
    // Component properties
    // -------------------------------------------------------------------------

    created() {

    }

    mounted() {
        WebComponentBootstrapper.registerElementInstance(this, this.$el);

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

        let drawingCanvas: DrawingCanvasEditor = new DrawingCanvasEditor('mycanvas', {}, {
            width: 800,
            height: 1000,
            drawingShapes: [],
            gridX: 200,
            gridY: 100
        });
        settings.shapeTemplate = ShapeTemplatesConstants.Pentagon;
        drawingCanvas.addShape(Guid.newGuid(), DrawingShapeTypes.Undefined, settings, { isMultilingualString: true, "en-us": "pentagon", "sv-se": "pentagon sv" }, false, 100, 200);
        settings.shapeTemplate = ShapeTemplatesConstants.Circle;
        drawingCanvas.addShape(Guid.newGuid(), DrawingShapeTypes.Undefined, settings, { isMultilingualString: true, "en-us": "Circle", "sv-se": "Circle sv" }, false, 200, 400);
        settings.shapeTemplate = ShapeTemplatesConstants.Diamond;
        drawingCanvas.addShape(Guid.newGuid(), DrawingShapeTypes.Undefined, settings, { isMultilingualString: true, "en-us": "diamond", "sv-se": "diamond sv" }, false, 200, 600);

        this.drawingCanvas1 = new DrawingCanvasEditor('test1', {}, {
            width: 800,
            height: 1000,
            drawingShapes: [],
            gridX: 200,
            gridY: 100
        });
        settings.shapeTemplate = ShapeTemplatesConstants.Pentagon;
        this.drawingCanvas1.addShape(Guid.newGuid(), DrawingShapeTypes.Undefined, settings, { isMultilingualString: true, "en-us": "pentagon", "sv-se": "pentagon sv" }, false, 100, 200);

    }

    updateShape() {
        var changedDefinition: DrawingShapeDefinition = {
            activeBackgroundColor: 'red',
            backgroundColor: 'green',
            borderColor: 'pink',
            fontSize: 20,
            textColor: '#d36249',
            width: 200,
            height: 300,
            textPosition: TextPosition.Center,
            shapeTemplate: ShapeTemplatesConstants.Pentagon
        } as DrawingShapeDefinition;
        this.drawingCanvas1.updateShapeDefinition(this.drawingCanvas1.drawingShapes[0], changedDefinition, null, false);
    }

    beforeDestroy() {

    }

    // -------------------------------------------------------------------------
    // Event
    // -------------------------------------------------------------------------


    render(h) {
        var changedDefinition: DrawingShapeDefinition = {
            activeBackgroundColor: 'red',
            backgroundColor: 'green',
            borderColor: 'red',
            fontSize: 20,
            textColor: '#d36249',
            width: 200,
            height: 300,
            textPosition: TextPosition.Center,
            shapeTemplate: ShapeTemplatesConstants.Pentagon
        } as DrawingShapeDefinition;
        return (
            <div>
                <v-btn onClick={() => { this.openFreeForm = true; }}>Open Freeform</v-btn>
                <div class="container">
                    <canvas id="mycanvas" width="400" height="3000"></canvas>
                </div>
                <br />
                <div>
                    <canvas id="test1" width="400" height="3000"></canvas>
                </div>
                <br />
                <div>
                    <canvas id="test2" width="400" height="3000"></canvas>
                </div>
                <v-btn onClick={() => {
                    var drawingCanvas2 = new DrawingCanvasEditor('test2', {}, this.drawingCanvas1.getCanvasDefinitionJson());
                    //this.updateShape();
                }} >change ui</v-btn>
                {this.openFreeForm && <opm-free-form shapeDefinition={changedDefinition} onClosed={() => { this.openFreeForm = false; }}
                    onSaved={() => { }}></opm-free-form>}
            </div>
        );
    }
}

WebComponentBootstrapper.registerElement((manifest) => {
    vueCustomElement(manifest.elementName, FabricPlayComponent);
});
