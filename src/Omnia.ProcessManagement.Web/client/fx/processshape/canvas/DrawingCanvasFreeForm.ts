import { fabric } from 'fabric';
import { FreeformShape, ShapeExtension } from '../shapes';
import { CanvasDefinition, DrawingShape, DrawingShapeTypes } from '../../models/data/drawingdefinitions';
import { DrawingCanvasEditor } from './DrawingCanvasEditor';
import { DrawingShapeDefinition } from '../../models';
import { Guid } from '@omnia/fx-models';
import { FabricPathShape, FabricShapeExtension, FabricPolylineShape, FabricLineShape } from '../fabricshape';

export class DrawingCanvasFreeForm extends DrawingCanvasEditor implements CanvasDefinition {
    private polylineShape: fabric.Polyline = null;
    private points: Array<fabric.Point> = [];
    private lines: Array<fabric.Line> = [];
    private lineCounter = 0;
    private x = 0;
    private y = 0;
    private strokeWidth = 1;
    private isDrawing: boolean = true;
    private isDrawingFree: boolean = false;
    private isMouseDown: boolean = false;
    private shapeDefinition: DrawingShapeDefinition;

    constructor(elementId: string, options?: fabric.ICanvasOptions, definition?: CanvasDefinition, callback?: (drawingShape: DrawingShape) => {}) {
        super(elementId, Object.assign({ preserveObjectStacking: true }, options || {}), definition, callback);
        this.init();
    }

    private init() {
        this.polylineShape = null;
        this.points = [];
        this.lines = [];
        this.lineCounter = 0;
        this.x = 0;
        this.y = 0;
        this.isDrawingFree = false;
        this.isMouseDown = false;
    }

    protected addEventListener() {
        this.canvasObject.on('mouse:down', (options) => {
            if (!this.isDrawing)
                return;
            this.isMouseDown = true;
            if (this.isDrawing && this.polylineShape == null) {
                this.addLine(options, this.shapeDefinition.borderColor);
                this.canvasObject.on('mouse:up', (options) => {
                    if (!this.isDrawing)
                        return;

                    if (this.isDrawingFree) {
                        this.addLine(options, this.shapeDefinition.borderColor);
                    }
                    this.canvasObject.selection = true;
                    this.isDrawingFree = false;
                    this.isMouseDown = false;
                });
            } else
                this.finishDrawing();
        })

        this.canvasObject.on('mouse:move', (options) => {
            if (!this.isDrawing)
                return;

            if (this.isMouseDown && (options.pointer.x != this.x || options.pointer.y != this.y)) {
                this.isDrawingFree = true;
            }
            else if (this.lines[0] !== null && this.lines[0] !== undefined) {
                this.setStartingPoint(options);
                this.lines[this.lineCounter - 1].set({
                    x2: this.x,
                    y2: this.y
                });
                this.checkFinishDrawing();
                this.canvasObject.renderAll();
            }
        });
    }

    private addLine(options, stroke) {
        this.canvasObject.selection = false;
        this.setStartingPoint(options);
        this.points.push(new fabric.Point(this.x, this.y));
        var points = [this.x, this.y, this.x, this.y];
        var line = new fabric.Line(points, {
            strokeWidth: this.strokeWidth,
            selectable: false,
            stroke: stroke,
            fill: this.shapeDefinition.backgroundColor
        });
        this.lines.push(line);
        this.canvasObject.add(this.lines[this.lineCounter]);
        this.lineCounter++;
    }

    private checkFinishDrawing() {
        if (this.isInRootPointZone()) {
            if (this.polylineShape == null) {
                this.polylineShape = this.makePolylineShapeCompleted(this.points);
                this.makePathShapesCompleted(this.shapeDefinition.backgroundColor);
                this.canvasObject.add(this.polylineShape);
            }
        } else if (this.polylineShape) {
            this.canvasObject.remove(this.polylineShape);
            this.makePathShapesCompleted(null);
            this.polylineShape = null;
        }
    }

    private finishDrawing() {
        if (this.isInRootPointZone()) {
            this.createFreeFromShape();

            this.canvasObject.isDrawingMode = false;
            this.isDrawing = false;
            this.init();
            this.canvasObject.renderAll();
            this.canvasObject.selection = true;
            this.canvasObject.renderAll();
        }
    }

    private isInRootPointZone() {
        var space = 5;
        return this.lines.length > 2 && this.x >= this.lines[0].x1 - space && this.x <= this.lines[0].x1 + space
            && this.y >= this.lines[0].y1 - space && this.y <= this.lines[0].y1 + space;
    }

    private createFreeFromShape() {
        let lineDefinition: DrawingShapeDefinition = Object.assign({}, this.shapeDefinition);
        lineDefinition.activeBorderColor = this.shapeDefinition.activeBackgroundColor;
        lineDefinition.borderColor = this.shapeDefinition.backgroundColor;
        let nodes: Array<FabricShapeExtension> = [];
        let pathsObject = this.canvasObject._objects.filter((object: fabric.IPathOptions) => {
            return object.type == 'path' && object.path.length > 2;
        });
        pathsObject.forEach((object) => {
            let objectJson = object.toObject();
            nodes.push(new FabricPathShape(this.shapeDefinition, false, objectJson));
            let path = objectJson.path;
            let points = [path[0][1] - 1, path[0][2] - 1, path[path.length - 1][1] - 1, path[path.length - 1][2] - 1];
            nodes.push(new FabricLineShape(lineDefinition, false, { points: points, strokeWidth: 5 }));
        })
        nodes.push(new FabricPolylineShape(this.shapeDefinition, false, this.polylineShape.toObject()));
        let drawingShape: DrawingShape = {
            id: Guid.newGuid(),
            type: DrawingShapeTypes.Undefined,
            title: null,
            shape: new FreeformShape(this.shapeDefinition, nodes, false, null, true)
        };
        this.lines.forEach((value) => {
            this.canvasObject.remove(value);
        });

        pathsObject.forEach((object) => {
            this.canvasObject.remove(object);
        });
        this.canvasObject.remove(this.polylineShape);

        (drawingShape.shape as ShapeExtension).shapeObject.forEach(s => this.canvasObject.add(s));
        this.drawingShapes.push(drawingShape);
    }

    private setStartingPoint(options) {
        if (this.isDrawingFree || this.points.length == 0) {
            let pathsObject: Array<fabric.IPathOptions> = this.canvasObject._objects.filter((object: fabric.IPathOptions) => {
                return object.type == 'path';
            });
            if (pathsObject.length > 0) {
                let pathObject = pathsObject[pathsObject.length - 1];
                this.x = pathObject.path[pathObject.path.length - 1][1];
                this.y = pathObject.path[pathObject.path.length - 1][2];
                return;
            }
        }
        this.x = options.e.offsetX;
        this.y = options.e.offsetY;
    }

    private makePolylineShapeCompleted(points) {
        var left = this.findLeftPaddingForPolyline(points);
        var top = this.findTopPaddingForPolyline(points);
        points.push(new fabric.Point(points[0].x, points[0].y));
        var shape = new fabric.Polyline(points, {
            fill: this.shapeDefinition.backgroundColor,
            stroke: this.shapeDefinition.backgroundColor
        });
        shape.set({
            left: left,
            top: top,
        });

        return shape;
    }

    private makePathShapesCompleted(fill) {
        this.canvasObject._objects.filter(o => o.type == 'path')
            .forEach((object: fabric.Object) => {
                object.set({ fill: fill });
            });
    }

    private findTopPaddingForPolyline(polylinePoints) {
        var result = 999999;
        for (var f = 0; f < this.lineCounter; f++) {
            if (polylinePoints[f].y < result) {
                result = polylinePoints[f].y;
            }
        }
        return Math.abs(result);
    }

    private findLeftPaddingForPolyline(polylinePoints) {
        var result = 999999;
        for (var i = 0; i < this.lineCounter; i++) {
            if (polylinePoints[i].x < result) {
                result = polylinePoints[i].x;
            }
        }
        return Math.abs(result);
    }

    start(shapeDefinition: DrawingShapeDefinition) {
        this.shapeDefinition = shapeDefinition;
        this.canvasObject.isDrawingMode = true;
        this.canvasObject.freeDrawingBrush.color = this.shapeDefinition.borderColor;
        this.canvasObject.freeDrawingBrush.width = this.strokeWidth;
    }

}
