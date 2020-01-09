import { fabric } from 'fabric';
import { CircleShape, DiamondShape, Shape, PentagonShape, MediaShape, ShapeFactory, FreeformShape, IShape, ShapeExtension } from '../shapes';
import { Guid, GuidValue, MultilingualString } from '@omnia/fx-models';
import { CanvasDefinition, DrawingShape, DrawingShapeTypes, DrawingProcessStepShape, DrawingCustomLinkShape } from '../../models/data/drawingdefinitions';
import { DrawingShapeDefinition } from '../../models';
import { Utils, Inject } from '@omnia/fx';
import { ShapeTemplatesConstants, TextSpacingWithShape } from '../../constants';
import { IFabricShape } from '../fabricshape';
import { setTimeout } from 'timers';

export class DrawingCanvas implements CanvasDefinition {

    backgroundImageUrl: string;
    width: number;
    height: number;
    gridX?: number;
    gridY?: number;
    drawingShapes: DrawingShape[];
    protected selectable = false;
    protected canvasObject: fabric.Canvas;
    protected onSelectingShape: (shape: DrawingShape) => void;

    private lineColor = '#ccc';
    private defaultPosition = 10;
    private isSetHover: boolean = false;
    private selectedShape: { id: GuidValue, type: DrawingShapeTypes } = null;

    constructor(elementId: string, options: fabric.ICanvasOptions, definition: CanvasDefinition, isSetHover?: boolean) {
        this.drawingShapes = [];
        this.isSetHover = isSetHover || false;
        if (definition) {
            this.correctCanvasDefinition(definition);
            this.initShapes(elementId, options, definition.drawingShapes);
        }
    }

    destroy() {
        if (this.canvasObject && !Utils.isArrayNullOrEmpty(this.canvasObject._objects))
            this.canvasObject.dispose();
    }

    setSelectingShapeCallback(onSelectingShape: (shape: DrawingShape) => void) {
        this.onSelectingShape = onSelectingShape;
        this.onSelectingShape(null);
    }

    getCanvasDefinitionJson(): CanvasDefinition {
        let shapes: DrawingShape[] = [];
        this.drawingShapes.forEach(s => shapes.push(Object.assign({}, s)));
        shapes.forEach(s => s.shape = (s.shape as Shape).getShapeJson());

        return {
            backgroundImageUrl: this.backgroundImageUrl,
            width: this.width,
            height: this.height,
            gridX: this.gridX,
            gridY: this.gridY,
            drawingShapes: shapes
        }
    }

    setSelectedShapeItemId(shapeIdentityId: GuidValue, type: DrawingShapeTypes) {
        this.selectedShape = { id: shapeIdentityId, type: type };
        this.updateSelectedShapeStyle();
    }

    private updateSelectedShapeStyle() {
        if (this.selectedShape == null)
            return;
        this.drawingShapes.forEach(s => (s.shape as Shape).setSelectedShape(false));
        let drawingShape: DrawingShape = null;
        if (this.selectedShape.type == DrawingShapeTypes.ProcessStep) {
            drawingShape = this.drawingShapes.find(s => (s as DrawingProcessStepShape).processStepId == this.selectedShape.id);
        }
        else {
            drawingShape = this.drawingShapes.find(s => s.id == this.selectedShape.id);
        }
        if (drawingShape) {
            (drawingShape.shape as Shape).setSelectedShape(true);
            this.canvasObject.renderAll();
        }
    }

    protected findDrawingShape(object: fabric.Object): DrawingShape {
        if (object == null)
            return null;
        return this.drawingShapes.find(d => {
            return (d.shape as Shape).shapeObject && (d.shape as Shape).shapeObject.find(s => s == object) != null;
        });
    }

    private renderBackgroundImage(drawingShapes: DrawingShape[]) {
        if (this.backgroundImageUrl) {
            fabric.Image.fromURL(this.backgroundImageUrl, (img) => {
                img.scaleToWidth(this.width);
                let scaleX = img.scaleX;
                img.scaleToHeight(this.height);
                img.scaleX = scaleX;
                this.canvasObject.setBackgroundImage(img, () => {
                    this.renderGridView(drawingShapes);
                });
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
        this.backgroundImageUrl = definition.backgroundImageUrl;
    }

    protected initShapes(elementId: string, options: fabric.ICanvasOptions, drawingShapes: DrawingShape[]) {
        this.selectable = false;
        this.renderCanvas(elementId, options, drawingShapes);
        this.addEventListener();
    }

    protected addEventListener() {
        this.canvasObject.on('mouse:down', (options) => {
            let findShape = this.drawingShapes.find(s => (s.shape as Shape).isHover());
            if (findShape != null && this.onSelectingShape) {
                this.onSelectingShape(findShape);
            }
        });
    }

    protected renderCanvas(elementId: string, options: fabric.ICanvasOptions, drawingShapes: DrawingShape[]) {
        options = Object.assign({ selection: false }, options || {});
        this.canvasObject = new fabric.Canvas(elementId, options);
        if (!Utils.isNullOrEmpty(this.backgroundImageUrl))
            this.renderBackgroundImage(drawingShapes);
        else
            this.renderGridView(drawingShapes);
    }

    private renderGridView(drawingShapes: DrawingShape[]) {
        this.canvasObject.setWidth(this.width);
        this.canvasObject.setHeight(this.height);
        if (this.gridX) {
            for (var i = 0; i < (this.width / this.gridX); i++) {
                this.canvasObject.add(new fabric.Line([i * this.gridX, 0, i * this.gridX, this.height], { stroke: this.lineColor, selectable: false }));
            }
            this.canvasObject.add(new fabric.Line([this.width - 1, 0, this.width - 1, this.height], { stroke: this.lineColor, selectable: false }));
        }
        if (this.gridY) {
            for (var i = 0; i < (this.height / this.gridY); i++) {
                this.canvasObject.add(new fabric.Line([0, i * this.gridY, this.width, i * this.gridY], { stroke: this.lineColor, selectable: false }))
            }
            this.canvasObject.add(new fabric.Line([0, this.height - 1, this.width, this.height - 1], { stroke: this.lineColor, selectable: false }));
        }

        if (drawingShapes) {
            let promises: Array<Promise<DrawingShape>> = [];
            drawingShapes.forEach(s => {
                if (ShapeTemplatesDictionary[s.shape.name]) {
                    promises.push(this.addShapeFromTemplateClassName(s));
                }
            })
            Promise.all(promises).then(() => { this.updateSelectedShapeStyle(); })
        }
    }

    private correctDefinition(definition: DrawingShapeDefinition, left: number, top: number) {
        definition.width = definition.width ? parseFloat(definition.width.toString()) : 0;
        definition.height = definition.height ? parseFloat(definition.height.toString()) : 0;
        definition.fontSize = definition.fontSize ? parseFloat(definition.fontSize.toString()) : 0;
        if (left == undefined || left == null) {
            left = (this.width - definition.width) / 2;
            if (left + definition.width > this.width)
                left = left - (left + definition.width - this.width);
            if (left < 0 || definition.width >= this.width)
                left = this.defaultPosition;
        }
        if (top == undefined || top == null)
            top = this.defaultPosition;
        return { left: left, top: top };
    }

    addShape(id: GuidValue, type: DrawingShapeTypes, definition: DrawingShapeDefinition,
        title: MultilingualString, left?: number, top?: number,
        processStepId?: GuidValue, customLinkId?: GuidValue, nodes?: IFabricShape[]) {
        if (!definition.shapeTemplate)
            return;
        let position = this.correctDefinition(definition, left, top);
        if (this.canvasObject && ShapeTemplatesDictionary[definition.shapeTemplate.name]) {
            let drawingShape: DrawingShape = {
                id: id,
                type: type,
                shape: {
                    name: definition.shapeTemplate.name,
                    nodes: nodes,
                    definition: definition,
                    left: position.left,
                    top: position.top
                },
                title: title
            };
            if (type == DrawingShapeTypes.ProcessStep) {
                (drawingShape as DrawingProcessStepShape).processStepId = processStepId;
            }
            if (type == DrawingShapeTypes.CustomLink) {
                (drawingShape as DrawingCustomLinkShape).linkId = customLinkId;
            }
            this.addShapeFromTemplateClassName(drawingShape);
        }
    }

    addDrawingShape(drawingShape: DrawingShape) {
        if (this.canvasObject) {
            this.addShapeFromTemplateClassName(drawingShape);
        }
    }

    updateShapeDefinition(id: GuidValue, definition: DrawingShapeDefinition, title: MultilingualString, left?: number, top?: number) {
        return new Promise<DrawingShape>((resolve, reject) => {
            let resolved = true;

            if (definition.shapeTemplate) {
                this.canvasObject.setHeight(parseFloat(definition.height.toString()) + TextSpacingWithShape + definition.fontSize)
                let oldShapeIndex = this.drawingShapes.findIndex(s => s.id == id);
                if (oldShapeIndex > -1) {
                    let currentDrawingShape = this.drawingShapes[oldShapeIndex];
                    this.drawingShapes.splice(oldShapeIndex, 1);
                    (currentDrawingShape.shape as Shape).shapeObject.forEach(n => this.canvasObject.remove(n));
                    let position = this.correctDefinition(definition, left, top);
                    currentDrawingShape.title = title;
                    currentDrawingShape.shape = {
                        name: definition.shapeTemplate.name,
                        nodes: definition.shapeTemplate.name == ShapeTemplatesConstants.Freeform.name ? currentDrawingShape.shape.nodes : null,
                        definition: definition,
                        left: position.left,
                        top: position.top
                    };
                    resolved = false;

                    this.addShapeFromTemplateClassName(currentDrawingShape).then((readyDrawingShape: DrawingShape) => {
                        resolve(readyDrawingShape);
                    });
                }
            }
            if (resolved) {
                resolve(null);
            }
        });
    }

    updateShape(id: GuidValue, definition: DrawingShapeDefinition, title: MultilingualString,
        type: DrawingShapeTypes, processStepId?: GuidValue, customLinkId?: GuidValue, nodes?: IFabricShape[]) {
        return new Promise<DrawingShape>((resolve, reject) => {
            let resolved = true;

            if (definition.shapeTemplate) {
                let oldShapeIndex = this.drawingShapes.findIndex(s => s.id == id);
                if (oldShapeIndex > -1) {
                    let currentDrawingShape = this.drawingShapes[oldShapeIndex];

                    let fabricShapeObject = (currentDrawingShape.shape as Shape).shapeObject[0];
                    let currentLeft = fabricShapeObject.left;
                    let currentTop = fabricShapeObject.top;

                    this.drawingShapes.splice(oldShapeIndex, 1);
                    (currentDrawingShape.shape as Shape).shapeObject.forEach(n => this.canvasObject.remove(n));


                    currentDrawingShape.title = title;
                    delete currentDrawingShape['processStepId'];
                    delete currentDrawingShape['linkId'];
                    currentDrawingShape.type = type;
                    if (type == DrawingShapeTypes.ProcessStep) {
                        (currentDrawingShape as DrawingProcessStepShape).processStepId = processStepId;
                    }
                    if (type == DrawingShapeTypes.CustomLink) {
                        (currentDrawingShape as DrawingCustomLinkShape).linkId = customLinkId;
                    }
                    currentDrawingShape.shape = {
                        name: definition.shapeTemplate.name,
                        nodes: nodes,
                        definition: definition,
                        left: currentLeft,
                        top: currentTop
                    };
                    resolved = false;

                    this.addShapeFromTemplateClassName(currentDrawingShape).then((readyDrawingShape: DrawingShape) => {
                        resolve(readyDrawingShape);
                    });
                }
            }
            if (resolved) {
                resolve(null);
            }
        });
    }

    deleteShape(shape: DrawingShape) {
        let findIndex = this.drawingShapes.findIndex(s => s.id == shape.id);
        if (findIndex > -1) {
            this.drawingShapes.splice(findIndex, 1);
            (shape.shape as Shape).shapeObject.forEach(n => this.canvasObject.remove(n));
        }
    }

    protected addShapeFromTemplateClassName(drawingShape: DrawingShape) {
        let readyDrawingShape = Utils.clone(drawingShape);

        let newShape = ShapeFactory.createService(ShapeTemplatesDictionary[readyDrawingShape.shape.definition.shapeTemplate.name], readyDrawingShape.shape.definition, readyDrawingShape.shape.nodes, readyDrawingShape.title, this.selectable, readyDrawingShape.shape.left, readyDrawingShape.shape.top);
        return new Promise<DrawingShape>((resolve, reject) => {
            newShape.ready().then((result) => {
                if (result) {
                    this.addShapeToCanvas(readyDrawingShape, newShape);
                }
                resolve(readyDrawingShape);
            });
        });
    }

    private addShapeToCanvas(drawingShape: DrawingShape, newShape: Shape) {
        newShape.setAllowHover(this.isSetHover);
        newShape.addEventListener(this.canvasObject, this.gridX, this.gridY);
        newShape.shapeObject.forEach(s => this.canvasObject.add(s));
        drawingShape.shape = newShape;
        this.drawingShapes.push(drawingShape);
    }
}

const ShapeTemplatesDictionary = {
    CircleShape,
    DiamondShape,
    PentagonShape,
    MediaShape,
    FreeformShape
}
