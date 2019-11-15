import { fabric } from 'fabric';
import { CanvasDefinition, IDrawingShapeNode } from '../../data/drawingdefinitions';
import { CircleShape, DiamondShape, Shape, PentagonShape } from '../shapes';
import { FabricShapeExtention, IShapeNode } from '../fabricshape';
import { DrawingShapeDefinition } from '../..';

export class DrawingCanvas implements CanvasDefinition {
    imageBackgroundUrl?: string;
    width: number;
    height: number;
    gridX?: number;
    gridY?: number;
    shapes: IDrawingShapeNode[];
    private canvasObject: fabric.Canvas;

    constructor(elementId: string, options?: fabric.ICanvasOptions, definition?: CanvasDefinition) {
        this.initShapes(elementId, options, definition);
    }

    getCanvasDefinition(): CanvasDefinition {
        throw new Error("Method not implemented.");
    }

    protected initShapes(elementId: string, options?: fabric.ICanvasOptions, definition?: CanvasDefinition) {
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
                this.canvasObject.on('object:moving', (options) => {
                    options.target.set({
                        top: Math.round(options.target.top / definition.gridY) * definition.gridY
                    });
                });
            }
            if (definition.gridY) {
                for (var i = 0; i < (definition.height / definition.gridY); i++) {
                    this.canvasObject.add(new fabric.Line([0, i * definition.gridY, definition.height, i * definition.gridY], { stroke: '#ccc', selectable: false }))
                }
                this.canvasObject.on('object:moving', (options) => {
                    options.target.set({
                        top: Math.round(options.target.top / definition.gridY) * definition.gridY
                    });
                });
            }

            if (definition.shapes) {
                definition.shapes.forEach(s => {
                    if (TemplatesDictionary[s.shape.name]) {
                        let shape: Shape = new TemplatesDictionary[s.shape.name](null, null, s.shape.nodes);
                        shape.shapeObject.forEach(s => this.canvasObject.add(s));
                    }
                })
            }
        }

    }

    addCanvasShape(shapeName: string, definition: DrawingShapeDefinition, nodes?: IShapeNode[], text?: string, selectable?: boolean, left?: number, top?: number) {
        if (this.canvasObject && TemplatesDictionary[shapeName]) {
            let shape: Shape = new TemplatesDictionary[shapeName](definition, nodes, text, selectable, left, top);
            shape.shapeObject.forEach(s => this.canvasObject.add(s));
        }
    }
}

export const TemplatesDictionary = {
    CircleShape,
    DiamondShape,
    PentagonShape
}