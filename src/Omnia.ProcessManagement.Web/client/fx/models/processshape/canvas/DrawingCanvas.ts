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
    protected selectable = false;
    protected canvasObject: fabric.Canvas;

    constructor(elementId: string, options?: fabric.ICanvasOptions, definition?: CanvasDefinition) {
        this.initShapes(elementId, options, definition);
        this.renderBackgroundImage(definition);
    }

    getCanvasDefinition(): CanvasDefinition {
        throw new Error("Method not implemented.");
    }

    private renderBackgroundImage(definition?: CanvasDefinition) {
        if (definition && definition.imageBackgroundUrl) {
            fabric.Image.fromURL(definition.imageBackgroundUrl, (img) => {
                img.scaleToWidth(this.canvasObject.getWidth());
                img.scaleToHeight(this.canvasObject.getHeight());
                this.canvasObject.setBackgroundImage(img, this.canvasObject.renderAll.bind(this.canvasObject), {
                });
                this.canvasObject.requestRenderAll();
            });
        }
    }

    protected initShapes(elementId: string, options?: fabric.ICanvasOptions, definition?: CanvasDefinition) {
        this.selectable = false;
        options = Object.assign({ selection: this.selectable }, options || {});
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
        }

    }

    addCanvasShape(shapeName: string, definition: DrawingShapeDefinition, nodes?: IShapeNode[], text?: string, left?: number, top?: number) {
        if (this.canvasObject && TemplatesDictionary[shapeName]) {
            let shape: Shape = new TemplatesDictionary[shapeName](definition, nodes, text, this.selectable, left, top);
            shape.shapeObject.forEach(s => this.canvasObject.add(s));
        }
    }
}

const TemplatesDictionary = {
    CircleShape,
    DiamondShape,
    PentagonShape
}