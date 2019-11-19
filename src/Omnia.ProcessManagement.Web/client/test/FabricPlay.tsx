

import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { fabric } from 'fabric';
import { IWebComponentInstance, WebComponentBootstrapper, vueCustomElement } from '@omnia/fx';
//import FabricTextShape from '../fx/models/processshape/fabricshape/FabricTextShape';
import { Enums } from '../core';
import { ShapeTemplatesConstants } from '../fx';
import { DrawingShapeDefinition, TextPosition } from '../fx/models';
import { CircleShape, FabricShapeExtention, ShapeNodeType, FabricCircleShape, DiamondShape, Shape, PentagonShape } from '../fx/models/processshape';
import { FabricShapeNodeTypes } from '../fx/models';
import { DrawingCanvas, DrawingCanvasEditor } from '../fx/models/processshape/canvas';
import { Guid } from '@omnia/fx-models';


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
        //this.canvas = new fabric.Canvas('c', { selection: false });
        //let json = JSON.parse(`{"type":"circle","version":"3.4.0","originX":"left","originY":"top","left":87.79,"top":27.62,"width":100,"height":100,"fill":"blue","stroke":null,"strokeWidth":1,"strokeDashArray":null,"strokeLineCap":"butt","strokeDashOffset":0,"strokeLineJoin":"miter","strokeMiterLimit":4,"scaleX":0.78,"scaleY":1,"angle":38,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"clipTo":null,"backgroundColor":"","fillRule":"nonzero","paintFirst":"fill","globalCompositeOperation":"source - over","transformMatrix":null,"skewX":0,"skewY":0,"radius":50,"startAngle":0,"endAngle":6.283185307179586}`);

        var settings: DrawingShapeDefinition = {
            activeBackgroundColor: 'red',
            backgroundColor: 'blue',
            borderColor: 'black',
            fontSize: 15,
            textColor: '#faf',
            width: 100,
            height: 100,
            textPosition: TextPosition.Center,
        } as DrawingShapeDefinition;

        ////this.testShape = new CircleShape(settings);
        ////this.testShape.schema.forEach(s => this.canvas.add(s));

        //let test = new FabricCircleShape(settings, json);
        //this.canvas.add(test.schema);

        //this.canvas = new DrawingCanvas('c', { selection: false }, {
        //    width: 800,
        //    height: 1000,
        //    gridX: 100,
        //    gridY: 200,
        //    shapes: [
        //        {
        //            shape: {
        //                name: ShapeTemplatesConstants.Circle.name,
        //                nodes: [{
        //                    shapeNodeType: FabricShapeNodeTypes.circle,
        //                    properties: {
        //                        left: 300,
        //                        top: 300,
        //                        radius: 50,
        //                        fill: '#9f9',
        //                    }
        //                },
        //                {
        //                    shapeNodeType: FabricShapeNodeTypes.text,
        //                    properties: {
        //                        text: 'diamond',
        //                        left: 300,
        //                        top: 480,
        //                        fill: '#000', fontSize: 20,
        //                        lockScalingX: true,
        //                        lockScalingY: true
        //                    }
        //                }
        //                ]
        //            }
        //        },
        //        {
        //            shape: {
        //                name: ShapeTemplatesConstants.Diamond.name,
        //                nodes: [{
        //                    shapeNodeType: FabricShapeNodeTypes.rect,
        //                    properties: {
        //                        left: 100,
        //                        top: 100,
        //                        width: 50,
        //                        height: 50,
        //                        fill: '#faa',
        //                        originX: 'left',
        //                        originY: 'top',
        //                        angle: 45,
        //                    }
        //                },
        //                {
        //                    shapeNodeType: FabricShapeNodeTypes.text,
        //                    properties: {
        //                        text: 'diamond',
        //                        left: 300,
        //                        top: 280,
        //                        fill: '#000',
        //                        fontSize: 20,
        //                        lockScalingX: true,
        //                        lockScalingY: true
        //                    }
        //                }
        //                ]
        //            }
        //        }
        //    ]
        //}).canvasObject;
        //new DiamondShape(settings, 'test').nodes.forEach(n => this.canvas.add(n.fabricObject));

        //new PentagonShape(settings, 'pentagon').nodes.forEach(n => this.canvas.add(n.fabricObject));
        //settings.textPosition = TextPosition.Center;
        //new PentagonShape(settings, 'pentagon').nodes.forEach(n => this.canvas.add(n.fabricObject));
        let drawingCanvas: DrawingCanvas = new DrawingCanvas('mycanvas', {}, {
            width: 800,
            height: 1000,
            shapes: [],
            gridX: 200,
            gridY: 100,
        });
        settings.shapeTemplate = ShapeTemplatesConstants.Pentagon;
        drawingCanvas.addShape(Guid.newGuid(), settings, null, false, 'pentagon');
        settings.shapeTemplate = ShapeTemplatesConstants.Circle;
        drawingCanvas.addShape(Guid.newGuid(), settings, null, false, 'circle');
        settings.shapeTemplate = ShapeTemplatesConstants.Diamond;
        drawingCanvas.addShape(Guid.newGuid(), settings, null, false, 'diamond');
      

        this.drawingCanvas1 = new DrawingCanvasEditor('test2', {}, {
            width: 800,
            height: 1000,
            shapes: [],
            gridX: 200,
            gridY: 100,
            //   imageBackgroundUrl:'http://fabricjs.com/assets/jail_cell_bars.png'
        });
        settings.shapeTemplate = ShapeTemplatesConstants.Pentagon;
        this.drawingCanvas1.addShape(Guid.newGuid(), settings, null, false, 'pentagon', 100, 200);
        //settings.shapeTemplate = ShapeTemplatesConstants.Media;
        //this.drawingCanvas1.addShape(Guid.newGuid(), settings, null, false, 'test image', 300, 300);
        //settings.shapeTemplate = ShapeTemplatesConstants.Freeform;
        //this.drawingCanvas1.addShape(Guid.newGuid(), settings,
        //    [{
        //        shapeNodeType: FabricShapeNodeTypes.rect,
        //        properties: {
        //            left: 100,
        //            top: 100,
        //            width: 50,
        //            height: 50,
        //            fill: '#faa',
        //            originX: 'left',
        //            originY: 'top',
        //            angle: 45,
        //        }, specificProperties: {}
        //    },
        //    {
        //        shapeNodeType: FabricShapeNodeTypes.text,
        //        properties: {
        //            text: 'diamond',
        //            left: 300,
        //            top: 280,
        //            fill: '#000',
        //            fontSize: 20,
        //            lockScalingX: true,
        //            lockScalingY: true
        //        }, specificProperties: {}
        //    }
        //    ]
        //    , false, 'freeform', 100, 200);
        //this.drawingCanvas1.shapes[1].shape.nodes[0].properties['imageUrl'] = 'http://fabricjs.com/assets/jail_cell_bars.png';
        //this.drawingCanvas1.updateShapeDefinition(this.drawingCanvas1.shapes[1], settings);
        //settings.textPosition = TextPosition.Bottom;
        //let a: PentagonShape = new PentagonShape(settings, null, 'pentagon', true, 100, 200);
        //let b = this.canvas.add(a.shapeObject);
        //b.on('object:selected', (e) => {
        //    if (e.target) {
        //        a.shapeObject
        //    }
        //});
        //b.on('object:scaling', (e) => {
        //    if (e.target) {
        //        e.target.setOptions({ text: 'test', fontSize: '20' });
        //    }
        //});
        //b.on('object:modified', (event: any) => {
        //    if (event.target) {
        //        debugger
        //        event.target.fontSize *= event.target.scaleX;
        //        event.target.fontSize = event.target.fontSize.toFixed(0);
        //        event.target.scaleX = 1;
        //        event.target.scaleY = 1;
        //        event.target.setOptions({ text: 'test', fontSize: '20' });
        //    }
        //});
        //let nodes: Array<FabricShapeExtention> = [];
        //let node0 = new FabricCircleShape(null, {
        //    left: 300,
        //    top: 300,
        //    radius: 50,
        //    fill: '#9f9',
        //    originX: 'left',
        //    originY: 'top',
        //    centeredRotation: true
        //});
        //let node1 = new FabricTextShape(null, {
        //    text:'test',
        //    left: 300,
        //    top: 280,
        //    fill: '#fff444', fontSize: 20
        //});
        //nodes.push(node0);
        //nodes.push(node1);
        //nodes.push({
        //    shapeNodeType: FabricShapeNodeTypes.rect, properties: {
        //        left: 100,
        //        top: 100,
        //        width: 50,
        //        height: 50,
        //        fill: '#faa',
        //        originX: 'left',
        //        originY: 'top',
        //        centeredRotation: true
        //    }
        //})
        //this.testShape = new CircleShape(null, nodes);
        //this.testShape.schema.forEach(s => this.canvas.add(s));
        //let shapes: ProcessStepShapeEditor;
        //shapes.shape = testShape;

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
        this.drawingCanvas1.updateShapeDefinition(this.drawingCanvas1.shapes[0], changedDefinition, false, 'plan2');
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
                <div>
                    <canvas id="test2" width="400" height="3000"></canvas>
                </div>
                <br/>
                <div>
                    <canvas id="test1" width="400" height="3000"></canvas>
                </div>
                <v-btn onClick={() => {
                    var drawingCanvas2 = new DrawingCanvasEditor('test1', {}, this.drawingCanvas1.getCanvasDefinitionJson());
                    //this.updateShape();
                }} >change ui</v-btn>
                <v-btn onClick={() => {
                    var drawingCanvas2 = new DrawingCanvasEditor('test3', {}, this.drawingCanvas1.getCanvasDefinitionJson());
                    //this.updateShape();
                }} >change ui1</v-btn>
                <br />
                <div>
                    <canvas id="test3" width="400" height="3000"></canvas>
                </div>
            </div>
        );
    }
}

WebComponentBootstrapper.registerElement((manifest) => {
    vueCustomElement(manifest.elementName, FabricPlayComponent);
});
