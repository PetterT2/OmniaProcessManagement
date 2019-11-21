

import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { fabric } from 'fabric';
import { IWebComponentInstance, WebComponentBootstrapper, vueCustomElement } from '@omnia/fx';
//import FabricTextShape from '../fx/models/processshape/fabricshape/FabricTextShape';
import { ShapeTemplatesConstants } from '../fx';
import { DrawingShapeDefinition, TextPosition } from '../fx/models';
import { CircleShape, FabricShape, FabricShapeType, FabricCircleShape, DiamondShape, Shape, PentagonShape } from '../fx/models/processshape';
import { FabricShapeTypes } from '../fx/models';
import { DrawingCanvas, DrawingCanvasEditor } from '../fx/models/processshape/canvas';
import { Guid } from '@omnia/fx-models';
import { DrawingShapeTypes } from '../fx/models/data/drawingdefinitions';


@Component
export class FabricPlayComponent extends Vue implements IWebComponentInstance {
    canvas: fabric.Canvas;
    testShape: CircleShape;
    drawingCanvas1: DrawingCanvas;
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
        drawingCanvas.addShape(Guid.newGuid(), DrawingShapeTypes.Undefined, settings, false, 'pentagon', 100, 200);
        settings.shapeTemplate = ShapeTemplatesConstants.Circle;
        drawingCanvas.addShape(Guid.newGuid(), DrawingShapeTypes.Undefined, settings, false, 'circle', 200, 400);
        settings.shapeTemplate = ShapeTemplatesConstants.Diamond;
        drawingCanvas.addShape(Guid.newGuid(), DrawingShapeTypes.Undefined, settings, false, 'diamond', 200, 600);

        this.drawingCanvas1 = new DrawingCanvasEditor('test1', {}, {
            width: 800,
            height: 1000,
            drawingShapes: [],
            gridX: 200,
            gridY: 100
        });
        settings.shapeTemplate = ShapeTemplatesConstants.Pentagon;
        this.drawingCanvas1.addShape(Guid.newGuid(), DrawingShapeTypes.Undefined, settings, false, 'pentagon', 100, 200);

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
        this.drawingCanvas1.updateShapeDefinition(this.drawingCanvas1.drawingShapes[0], changedDefinition, false, 'plan2');
    }

    beforeDestroy() {

    }

    // -------------------------------------------------------------------------
    // Event
    // -------------------------------------------------------------------------


    render(h) {
        return (
            <div>
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
            </div>
        );
    }
}

WebComponentBootstrapper.registerElement((manifest) => {
    vueCustomElement(manifest.elementName, FabricPlayComponent);
});
