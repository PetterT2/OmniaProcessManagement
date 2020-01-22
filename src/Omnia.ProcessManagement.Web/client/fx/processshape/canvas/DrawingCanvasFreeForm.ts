import { fabric } from 'fabric';
import { FreeformShape, ShapeExtension, IShape } from '../shapes';
import { CanvasDefinition, DrawingShape, DrawingShapeTypes } from '../../models/data/drawingdefinitions';
import { DrawingCanvasEditor } from './DrawingCanvasEditor';
import { DrawingShapeDefinition } from '../../models';
import { Guid, MultilingualString, GuidValue } from '@omnia/fx-models';
import { FabricPathShape, FabricShapeExtension, FabricPolylineShape, FabricLineShape, IFabricShape, FabricShape } from '../fabricshape';
import { ShapeHighlightProperties } from '../../constants';

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

    private shapeTitle: string;

    constructor(elementId: string, options: fabric.ICanvasOptions, definition: CanvasDefinition, isSetHover?: boolean,
        onClickEditShapeSettings?: (drawingShape: DrawingShape) => void,
        onDrawingChanged?: (refreshSettingsPanel?: boolean) => void,
        showGridlines?: boolean,
        darkHightlight?: boolean) {
        super(elementId, Object.assign({ preserveObjectStacking: true }, options || {}), definition, isSetHover, onClickEditShapeSettings, onDrawingChanged, showGridlines, darkHightlight);
    }

    private init() {
        this.drawingShapes = [];
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

            let highlightProperties = this.getHighlightProperties();

            if (this.isDrawing && this.polylineShape == null) {
                this.addLine(options, highlightProperties);
                this.canvasObject.on('mouse:up', (options) => {
                    if (!this.isDrawing)
                        return;
                    if (this.isDrawingFree) {
                        this.addLine(options, highlightProperties);
                    }
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

    getHighlightProperties() {
        let highlightProperties = this.darkHightlight === true ? ShapeHighlightProperties.dark :
            this.darkHightlight === false ? ShapeHighlightProperties.light : {
                stroke: this.shapeDefinition.borderColor || '#000'
            };

        return highlightProperties;
    }

    private addLine(options, highlightProperties) {
        this.canvasObject.selection = false;
        this.setStartingPoint(options);
        this.points.push(new fabric.Point(this.x, this.y));
        var points = [this.x, this.y, this.x, this.y];
        var line = new fabric.Line(points, Object.assign({
            strokeWidth: this.strokeWidth,
            selectable: false,
            fill: this.shapeDefinition.backgroundColor
        }, highlightProperties));
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
            this.canvasObject.renderAll();
        }
    }

    private isInRootPointZone() {
        let pathsObject = this.canvasObject._objects.filter((object: fabric.IPathOptions) => {
            return object.type == 'path' && object.path.length > 2;
        });

        var space = 2;
        return (this.lines.length > 2 && this.compareInZone(this.x, this.lines[0].x1, space)
            && this.compareInZone(this.y, this.lines[0].y1, space)
            || (pathsObject.length > 0 && this.compareInZone(pathsObject[0].toObject().path[0][1], pathsObject[pathsObject.length - 1].toObject().path[pathsObject[pathsObject.length - 1].toObject().path.length - 1][1], space)
                && this.compareInZone(pathsObject[0].toObject().path[0][2], pathsObject[pathsObject.length - 1].toObject().path[pathsObject[pathsObject.length - 1].toObject().path.length - 1][2], space)));
    }

    private compareInZone(p: number, targetP: number, space: number) {
        return p >= targetP - space && p <= targetP + space;
    }

    private createFreeFromShape() {
        let freeNodes = this.generateNodes();

        let drawingShape: DrawingShape = {
            id: Guid.newGuid(),
            type: DrawingShapeTypes.Undefined,
            title: null,
            shape: new FreeformShape(this.shapeDefinition, freeNodes.nodes, this.shapeTitle, true, this.polylineShape.left, this.polylineShape.top, this.darkHightlight)
        };
        this.lines.forEach((value) => {
            this.canvasObject.remove(value);
        });

        this.canvasObject._objects.filter((object: fabric.IPathOptions) => {
            return object.type == 'path';
        }).forEach((object) => {
            this.canvasObject.remove(object);
        });
        this.canvasObject.remove(this.polylineShape);
        this.drawingShapes = [];
        this.drawingShapes.push(drawingShape);
        this.drawingShapes[0].shape.nodes = (drawingShape.shape as FreeformShape).getShapeJson().nodes;
        (drawingShape.shape as FreeformShape).shapeObject.forEach(s => this.canvasObject.add(s));
        if (this.onSelectingShape)
            this.onSelectingShape(this.drawingShapes[0]);
    }

    private generateNodes() {
        let nodes: Array<FabricShape> = [];
        let pathsObject = this.canvasObject._objects.filter((object: fabric.IPathOptions) => {
            return object.type == 'path' && object.path.length > 2;
        });
        let pathShapes: Array<FabricPathShape> = [];

        pathsObject.forEach((object, index) => {
            let objectJson = object.toObject();
            objectJson['stroke'] = this.shapeDefinition.borderColor;
            pathShapes.push(new FabricPathShape(this.shapeDefinition, objectJson));
        })
        if (pathsObject.length > 0) {
            let path = pathShapes[0].properties['path'];
            let findNextPolyPoints = this.findNextPolyPoints(path[path.length - 1][1], path[path.length - 1][2], [], pathShapes.map(p => p.properties['path']));
            if (findNextPolyPoints.length > 0) {
                path[path.length - 1][0] = 'Q';
                path[path.length - 1][3] = path[path.length - 1][1];
                path[path.length - 1][4] = path[path.length - 1][2];
                findNextPolyPoints.forEach((p, index) => {
                    if (index < findNextPolyPoints.length - 1)
                        path.push(['Q', p[0].x, p[0].y, p.length > 1 ? p[1].x : p[0].x, p.length > 1 ? p[1].y : p[0].y]);
                });
                path.push(['L', findNextPolyPoints[findNextPolyPoints.length - 1][0].x, findNextPolyPoints[findNextPolyPoints.length - 1][0].y]);
            }
            nodes.push(pathShapes[0]);
        }
        else {
            let path = [];
            path.push(['M', this.polylineShape.points[0].x, this.polylineShape.points[0].y]);
            let pathShape = new FabricPathShape(this.shapeDefinition, { path: path })
            this.polylineShape.points.forEach((p, index) => {
                if (index > 0 && index < this.polylineShape.points.length - 1)
                    path.push(['Q', this.polylineShape.points[index].x, this.polylineShape.points[index].y, this.polylineShape.points[index].x, this.polylineShape.points[index].y]);
            })
            path.push(['L', this.polylineShape.points[this.polylineShape.points.length - 1].x, this.polylineShape.points[this.polylineShape.points.length - 1].y]);
            pathShape.properties['path'] = path;
            nodes.push(pathShape);
        }
        return { nodes: nodes, pathsObject: pathsObject };
    }

    private findNextPolyPoints(x: number, y: number, points: Array<fabric.Point[]>, paths: Array<any>) {
        let nx: number = x, ny: number = y;
        let point: fabric.Point;
        let findPathIndex = paths.findIndex(path => {
            return this.compareInZone(path[0][1], x, 2) && this.compareInZone(path[0][2], y, 2);;
        });
        if (findPathIndex > 0) {
            let path = paths[findPathIndex];
            points.push([new fabric.Point(path[0][1], path[0][2])]);
            path.forEach((p, index) => {
                if (index > 0 && index < path.length - 1) {
                    points.push([new fabric.Point(p[1], p[2])]);
                    if (p.length > 4 && index < path.length - 2) {
                        points[points.length - 1].push(new fabric.Point(p[3], p[4]));
                    }
                }
            })
            point = new fabric.Point(path[path.length - 2][3], path[path.length - 2][4]);
            nx = path[path.length - 1][1];
            ny = path[path.length - 1][2];
        }
        else {
            let pointIndex = this.polylineShape.points.findIndex(p => this.compareInZone(p.x, x, 2) && this.compareInZone(p.y, y, 2));
            if (pointIndex >= 0)
                point = this.polylineShape.points[pointIndex];
            if (pointIndex < this.polylineShape.points.length - 1) {
                nx = this.polylineShape.points[pointIndex + 1].x;
                ny = this.polylineShape.points[pointIndex + 1].y;
            }
        }
        if (point) {
            points.push([point]);
            if ((nx != x || ny != y) && points.find(p => (p[0].x == nx && p[0].y == ny)
                || (p.length > 1 && p[1].x == nx && p[1].y == ny)) == null)
                this.findNextPolyPoints(nx, ny, points, paths);
        }
        return points;
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

    protected setActiveObject(drawingShapeResult: DrawingShape) {

    }

    start(shapeDefinition: DrawingShapeDefinition, title: string) {
        this.init();
        this.shapeDefinition = shapeDefinition;
        this.canvasObject.isDrawingMode = true;

        //this.canvasObject.freeDrawingBrush.color = this.shapeDefinition.borderColor;
        //this.canvasObject.freeDrawingBrush.width = this.strokeWidth;
        this.shapeTitle = title;
    }

    stop() {
        this.isDrawing = false;
        this.canvasObject.isDrawingMode = false;
        this.canvasObject.selection = false;
    }
}
