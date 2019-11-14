import { fabric } from 'fabric';
import { CanvasDefinition, IDrawingShapeNode } from '../../data/drawingdefinitions';
import { CircleShape, DiamondShape, Shape, PentagonShape } from '../shapes';
import { FabricShapeExtention } from '../fabricshape';

export class DrawingCanvas implements CanvasDefinition {
    imageBackgroundUrl?: string;
    width: number;
    height: number;
    gridX?: number;
    gridY?: number;
    shapes: IDrawingShapeNode[];
    canvasObject: fabric.Canvas;

    constructor(elementId: string, options?: fabric.ICanvasOptions, definition?: CanvasDefinition) {
        this.initShapes(elementId, options, definition);
    }

    getCanvasDefinition(): CanvasDefinition {
        throw new Error("Method not implemented.");
    }


    private initShapes(elementId: string, options?: fabric.ICanvasOptions, definition?: CanvasDefinition) {
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
                        let shape: Shape = new TemplatesDictionary[s.shape.name](null, null, s.shape.nodes as FabricShapeExtention[]);
                        shape.nodes.forEach(n => this.canvasObject.add(n.fabricObject));
                    } 
                })
            }
        }

    }
}

export const TemplatesDictionary = {
    CircleShape,
    DiamondShape,
    PentagonShape
}