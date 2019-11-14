

import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { fabric } from 'fabric';
import { IWebComponentInstance, WebComponentBootstrapper, vueCustomElement } from '@omnia/fx';
//import FabricTextShape from '../fx/models/processshape/fabricshape/FabricTextShape';
import { Enums, ShapeTemplatesConstants } from '../core';
import { DrawingShapeDefinition } from '../fx/models';
import { CircleShape, FabricShapeExtention, ShapeNodeType, FabricCircleShape, DiamondShape, Shape, PentagonShape } from '../fx/models/processshape';
import { FabricShapeNodeTypes } from '../fx/models/processshape/fabricshape/IFabricShapeNode';
import { DrawingCanvas } from '../fx/models/processshape/canvas';


@Component
export class FabricPlayComponent extends Vue implements IWebComponentInstance {
    canvas: fabric.Canvas;
    testShape: CircleShape;
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
            width: 100,
            height: 100,
            textPosition: Enums.TextPosition.Above,
        } as DrawingShapeDefinition;
        ////this.testShape = new CircleShape(settings);
        ////this.testShape.schema.forEach(s => this.canvas.add(s));

        //let test = new FabricCircleShape(settings, json);
        //this.canvas.add(test.schema);
     
        this.canvas = new DrawingCanvas('c', { selection: false }, {
            width: 800,
            height: 1000,
            gridX: 100,
            gridY: 200,
            shapes: [
                  {
                    shape: {
                        name: ShapeTemplatesConstants.Circle.name,
                        nodes: [{
                            shapeNodeType: FabricShapeNodeTypes.circle,
                            properties: {
                                left: 300,
                                top: 300,
                                radius: 50,
                                fill: '#9f9',
                            }
                        },
                        {
                            shapeNodeType: FabricShapeNodeTypes.text,
                            properties: {
                                text: 'test',
                                left: 300,
                                top: 280,
                                fill: '#fff444', fontSize: 20
                            }
                        }
                        ]
                    }
                },
                {
                    shape: {
                        name: ShapeTemplatesConstants.Diamond.name,
                        nodes: [{
                            shapeNodeType: FabricShapeNodeTypes.rect,
                            properties: {
                                left: 100,
                                top: 100,
                                width: 50,
                                height: 50,
                                fill: '#faa',
                                originX: 'left',
                                originY: 'top',
                                angle: 45,
                            }
                        },
                        {
                            shapeNodeType: FabricShapeNodeTypes.text,
                            properties: {
                                text: 'diamond',
                                left: 300,
                                top: 280,
                                fill: '#000',
                                fontSize: 20
                            }
                        }
                        ]
                    }
                }
            ]
        }).canvasObject;
        //new DiamondShape(settings, 'test').nodes.forEach(n => this.canvas.add(n.fabricObject));

        new PentagonShape(settings, 'pentagon').nodes.forEach(n => this.canvas.add(n.fabricObject));
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



    beforeDestroy() {

    }

    // -------------------------------------------------------------------------
    // Event
    // -------------------------------------------------------------------------


    render(h) {
        return (
            <div>
                <canvas id="c" width="600" height="600"></canvas>
                <v-btn onClick={() => {
                    console.log(this.canvas.toJSON());
                    console.log(this.testShape.getShape());
                    debugger;
                }} >change ui</v-btn>
            </div>
        );
    }
}

WebComponentBootstrapper.registerElement((manifest) => {
    vueCustomElement(manifest.elementName, FabricPlayComponent);
});
