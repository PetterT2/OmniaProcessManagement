﻿import { fabric } from 'fabric';
import { CanvasDefinition, DrawingShape, DrawingShapeTypes } from '../../data/drawingdefinitions';
import { CircleShape, DiamondShape, Shape, PentagonShape, MediaShape, ShapeFactory, FreeformShape } from '../shapes';
import { FabricShapeExtention, IShapeNode } from '../fabricshape';
import { DrawingShapeDefinition } from '../..';
import { Guid, GuidValue } from '@omnia/fx-models';
import { IDrawingShapeNode } from '../../data/drawingdefinitions/IDrawingShapeNode';

export class DrawingCanvas implements CanvasDefinition {
    imageBackgroundUrl?: string;
    width: number;
    height: number;
    gridX?: number;
    gridY?: number;
    drawingShapes: DrawingShape[];
    protected selectable = false;
    protected canvasObject: fabric.Canvas;
    private lineColor = '#ccc';
    private defaultPosition = 10;

    constructor(elementId: string, options: fabric.ICanvasOptions, definition: CanvasDefinition) {
        this.drawingShapes = [];
        this.initShapes(elementId, options, definition);
        this.renderBackgroundImage(definition);
    }

    getCanvasDefinitionJson(): CanvasDefinition {
        let shapes: DrawingShape[] = [];
        this.drawingShapes.forEach(s => shapes.push(Object.assign({}, s)));
        shapes.forEach(s => s.shape = (s.shape as Shape).getShapeJson());

        return {
            imageBackgroundUrl: this.imageBackgroundUrl,
            width: this.width,
            height: this.height,
            gridX: this.gridX,
            gridY: this.gridY,
            drawingShapes: shapes
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

    private correctCanvasDefinition(definition: CanvasDefinition) {
        definition.width = definition.width ? parseFloat(definition.width.toString()) : 0;
        definition.height = definition.height ? parseFloat(definition.height.toString()) : 0;
        definition.gridX = definition.gridX ? parseFloat(definition.gridX.toString()) : 0;
        definition.gridY = definition.gridY ? parseFloat(definition.gridY.toString()) : 0;
        this.width = definition.width;
        this.height = definition.height;
        this.gridX = definition.gridX;
        this.gridY = definition.gridY;
    }

    protected initShapes(elementId: string, options: fabric.ICanvasOptions, definition: CanvasDefinition) {
        this.selectable = false;
        this.renderGridView(elementId, options, definition);
    }

    protected renderGridView(elementId: string, options: fabric.ICanvasOptions, definition: CanvasDefinition) {
        options = Object.assign({ selection: this.selectable }, options || {});
        this.canvasObject = new fabric.Canvas(elementId, options);
        if (definition) {
            this.correctCanvasDefinition(definition);
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

            if (definition.drawingShapes) {
                definition.drawingShapes.forEach(s => {
                    if (ShapeTemplatesDictionary[s.shape.name]) {
                        this.addShapeFromTemplateClassName(s.id, s.type, s.shape.nodes, s.shape.definition);
                    }
                })
            }
        }
    }

    private correctDefinition(definition: DrawingShapeDefinition, left: number, top: number) {
        definition.width = definition.width ? parseFloat(definition.width.toString()) : 0;
        definition.height = definition.height ? parseFloat(definition.height.toString()) : 0;
        definition.fontSize = definition.fontSize ? parseFloat(definition.fontSize.toString()) : 0;
        if (!left && !top) {
            left = (this.width - definition.width) / 2;
            if (left + definition.width > this.width)
                left = left - (left + definition.width - this.width);
            if (left < 0 || definition.width >= this.width)
                left = this.defaultPosition;
            top = this.defaultPosition;
        }
        return { left: left, top: top };
    }

    addShape(id: GuidValue, type: DrawingShapeTypes, definition: DrawingShapeDefinition, nodes?: IShapeNode[], isActive?: boolean, text?: string, left?: number, top?: number) {
        if (!definition.shapeTemplate)
            return;
        let position = this.correctDefinition(definition, left, top);
        if (this.canvasObject && ShapeTemplatesDictionary[definition.shapeTemplate.name]) {

            this.addShapeFromTemplateClassName(id, type, nodes, definition, isActive, text, position.left, position.top);
        }
    }

    updateShapeDefinition(oldDrawingShape: DrawingShape, definition: DrawingShapeDefinition, isActive?: boolean, text?: string, left?: number, top?: number) {
        if (!definition.shapeTemplate)
            return;
        let position = this.correctDefinition(definition, left, top);
        let id = Guid.newGuid();
        let type: DrawingShapeTypes = DrawingShapeTypes.Undefined;
        if (oldDrawingShape) {
            type = oldDrawingShape.type;
            id = oldDrawingShape.id;
            let oldShapeIndex = this.drawingShapes.findIndex(s => s.id == oldDrawingShape.id);
            if (oldShapeIndex > -1) {
                this.drawingShapes.splice(oldShapeIndex, 1);
                (oldDrawingShape.shape as Shape).shapeObject.forEach(n => this.canvasObject.remove(n));
            }
        }
        this.addShapeFromTemplateClassName(id, type, null, definition, isActive, text, position.left, position.top);
    }

    protected addShapeFromTemplateClassName(id: GuidValue, type: DrawingShapeTypes, nodes: IShapeNode[], definition: DrawingShapeDefinition, isActive?: boolean, text?: string, left?: number, top?: number) {
        let newShape = ShapeFactory.createService(ShapeTemplatesDictionary[definition.shapeTemplate.name], definition, nodes, isActive, text, this.selectable, left, top);
        newShape.ready().then((result) => {
            if (result)
                this.addShapeToCanvas(id, newShape, type);
        })
    }

    private addShapeToCanvas(id: GuidValue, newShape: Shape, type: DrawingShapeTypes) {
        newShape.addEventListener(this.canvasObject, this.gridX, this.gridY);
        newShape.shapeObject.forEach(s => this.canvasObject.add(s));
        this.drawingShapes.push({ id: id, shape: newShape, type: type });
    }
}

const ShapeTemplatesDictionary = {
    CircleShape,
    DiamondShape,
    PentagonShape,
    MediaShape,
    FreeformShape
}
