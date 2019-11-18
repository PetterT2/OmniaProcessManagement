﻿import { fabric } from 'fabric';
import { CanvasDefinition, IDrawingShapeNode } from '../../data/drawingdefinitions';
import { CircleShape, DiamondShape, Shape, PentagonShape } from '../shapes';
import { FabricShapeExtention, IShapeNode } from '../fabricshape';
import { DrawingShapeDefinition } from '../..';
import { DrawingCanvas } from './DrawingCanvas';

export class DrawingCanvasEditor extends DrawingCanvas implements CanvasDefinition {
    constructor(elementId: string, options?: fabric.ICanvasOptions, definition?: CanvasDefinition) {
        super(elementId, options, definition);
    }

    protected initShapes(elementId: string, options?: fabric.ICanvasOptions, definition?: CanvasDefinition) {
        this.selectable = true;
        this.canvasObject = new fabric.Canvas(elementId, options);
        if (definition) {
            this.width = definition.width;
            this.height = definition.height;
            this.gridX = definition.gridX;
            this.gridY = definition.gridY;

            this.canvasObject.setWidth(definition.width);
            this.canvasObject.setHeight(definition.height);
            if (definition.gridX) {
                for (var i = 0; i < (definition.width / definition.gridX); i++) {
                    this.canvasObject.add(new fabric.Line([i * definition.gridX, 0, i * definition.gridX, definition.width], { stroke: '#ccc', selectable: false }));
                }
            }
            if (definition.gridY) {
                for (var i = 0; i < (definition.height / definition.gridY); i++) {
                    this.canvasObject.add(new fabric.Line([0, i * definition.gridY, definition.height, i * definition.gridY], { stroke: '#ccc', selectable: false }))
                }
            }

            if (definition.shapes) {
                definition.shapes.forEach(s => {
                    if (TemplatesDictionary[s.shape.name]) {
                        let shape: Shape = new TemplatesDictionary[s.shape.name](null, s.shape.nodes, null, this.selectable);
                        shape.shapeObject.forEach(s => this.canvasObject.add(s));
                    }
                })
            }
            this.addEventListener();
        }
    }

    private addEventListener() {
        this.canvasObject.on('object:moving', (options) => {
            if (this.gridX)
                options.target.set({
                    left: Math.round(options.target.left / this.gridX) * this.gridX
                });
            if (this.gridY)
                options.target.set({
                    top: Math.round(options.target.top / this.gridY) * this.gridY
                });
        });
    }

}

const TemplatesDictionary = {
    CircleShape,
    DiamondShape,
    PentagonShape
}