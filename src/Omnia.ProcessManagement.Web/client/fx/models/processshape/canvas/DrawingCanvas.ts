import { fabric } from 'fabric';
import { CanvasDefinition, IDrawingShapeNode } from '../../data/drawingdefinitions';
import { CircleShape, DiamondShape, Shape, PentagonShape, MediaShape, ShapeFactory, FreeformShape } from '../shapes';
import { FabricShapeExtention, IShapeNode } from '../fabricshape';
import { DrawingShapeDefinition } from '../..';
import { Guid, GuidValue } from '@omnia/fx-models';

export class DrawingCanvas implements CanvasDefinition {
    imageBackgroundUrl?: string;
    width: number;
    height: number;
    gridX?: number;
    gridY?: number;
    shapes: IDrawingShapeNode[];
    protected selectable = false;
    protected canvasObject: fabric.Canvas;
    private newShapeId: GuidValue;
    private lineColor = '#ccc';

    constructor(elementId: string, options?: fabric.ICanvasOptions, definition?: CanvasDefinition) {
        this.shapes = [];
        this.initShapes(elementId, options, definition);
        this.renderBackgroundImage(definition);
    }

    getCanvasDefinitionJson(): CanvasDefinition {
        let shapes: IDrawingShapeNode[] = [];
        this.shapes.forEach(s => shapes.push(Object.assign({}, s)));
        shapes.forEach(s => s.shape = (s.shape as Shape).getShapeJson());
      
        return {
            imageBackgroundUrl: this.imageBackgroundUrl,
            width: this.width,
            height: this.height,
            gridX: this.gridX,
            gridY: this.gridY,
            shapes: shapes
        }
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
        this.renderGridView(elementId, options, definition);
    }

    protected renderGridView(elementId: string, options?: fabric.ICanvasOptions, definition?: CanvasDefinition) {
        options = Object.assign({ selection: this.selectable }, options || {});
        this.canvasObject = new fabric.Canvas(elementId, options);
        this.canvasObject.renderAll();
        if (definition) {
            this.width = parseInt(definition.width.toString());
            this.height = parseInt(definition.height.toString());
            this.gridX = parseInt(definition.gridX.toString());
            this.gridY = parseInt(definition.gridY.toString());

            this.canvasObject.setWidth(definition.width);
            this.canvasObject.setHeight(definition.height);
            if (definition.gridX) {
                for (var i = 0; i < (definition.width / definition.gridX); i++) {
                    this.canvasObject.add(new fabric.Line([i * definition.gridX, 0, i * definition.gridX, definition.height], { stroke: this.lineColor, selectable: false }));
                }
                this.canvasObject.add(new fabric.Line([definition.width - 1, 0, definition.width - 1, definition.height], { stroke: this.lineColor, selectable: false }));
            }
            if (definition.gridY) {
                for (var i = 0; i < (definition.height / definition.gridY); i++) {
                    this.canvasObject.add(new fabric.Line([0, i * definition.gridY, definition.width, i * definition.gridY], { stroke: this.lineColor, selectable: false }))
                }
                this.canvasObject.add(new fabric.Line([0, definition.height - 1, definition.width, definition.height - 1], { stroke: this.lineColor, selectable: false }));
            }

            if (definition.shapes) {
                definition.shapes.forEach(s => {
                    if (ShapeTemplatesDictionary[s.shape.name]) {
                        this.addShapeFromTemplateClassName(s.id, s.shape.nodes, s.shape.definition);
                    }
                })
            }
        }
    }

    addShape(id: GuidValue, definition: DrawingShapeDefinition, nodes?: IShapeNode[], isActive?: boolean, text?: string, left?: number, top?: number) {
        if (this.canvasObject && ShapeTemplatesDictionary[definition.shapeTemplate.name]) {
            if (!left && !top) {
                left = (this.width - definition.width) / 2;
                top = (this.height - definition.height) / 2;
            }
            this.addShapeFromTemplateClassName(id, nodes, definition, isActive, text, left, top);
        }
    }

    updateShapeDefinition(oldDrawingShape: IDrawingShapeNode, definition: DrawingShapeDefinition, isActive?: boolean, text?: string, left?: number, top?: number) {
        let oldShapeIndex = this.shapes.findIndex(s => s.id == oldDrawingShape.id);
        if (oldShapeIndex > -1) {
            this.shapes.splice(oldShapeIndex, 1);
            (oldDrawingShape.shape as Shape).shapeObject.forEach(n => this.canvasObject.remove(n));
        }
        this.addShapeFromTemplateClassName(oldDrawingShape.id, null, definition, isActive, text, left, top);
    }

    protected addShapeFromTemplateClassName(id: GuidValue, nodes: IShapeNode[], definition: DrawingShapeDefinition, isActive?: boolean, text?: string, left?: number, top?: number) {
        this.newShapeId = id;
        let newShape = ShapeFactory.createService(ShapeTemplatesDictionary[definition.shapeTemplate.name], definition, nodes, isActive, text, this.selectable, left, top);
        newShape.ready().then((result) => {
            if (result)
                this.addShapeToCanvas(newShape);
        })
    }

    private addShapeToCanvas(newShape: Shape) {
        newShape.addEventListener(this.canvasObject, this.gridX, this.gridY);
        newShape.shapeObject.forEach(s => this.canvasObject.add(s));
        this.shapes.push({ id: this.newShapeId, shape: newShape });
    }
}

const ShapeTemplatesDictionary = {
    CircleShape,
    DiamondShape,
    PentagonShape,
    MediaShape,
    FreeformShape
}
