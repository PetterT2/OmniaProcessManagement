import { fabric } from 'fabric';
import { CircleShape, DiamondShape, Shape, PentagonShape, MediaShape, ShapeFactory, FreeformShape, ShapeObject, ShapeExtension, RectShape } from '../shapes';
import { Guid, GuidValue, MultilingualString } from '@omnia/fx-models';
import { CanvasDefinition, DrawingShape, DrawingShapeTypes, ProcessStepDrawingShape, CustomLinkDrawingShape, ExternalProcessStepDrawingShape } from '../../models/data/drawingdefinitions';
import { DrawingShapeDefinition, TextPosition, ShapeTemplateType, TextAlignment, DrawingImageShapeDefinition } from '../../models';
import { Utils, Inject } from '@omnia/fx';
import { ShapeTemplatesConstants, TextSpacingWithShape } from '../../constants';
import { FabricShapeData } from '../fabricshape';
import { setTimeout } from 'timers';
import { DrawingShapeOptions } from '../../../models/processdesigner';
import { defineLocale } from 'moment';

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
    protected showGridlines: boolean = true;
    protected darkHightlight: boolean = null;
    private selectedShape: { id: GuidValue } = null;
    private promises: Array<Promise<DrawingShape>> = [];

    constructor(elementId: string, options: fabric.ICanvasOptions, definition: CanvasDefinition, isSetHover?: boolean, showGridlines?: boolean, darkHightlight?: boolean) {
        this.drawingShapes = [];
        this.isSetHover = isSetHover || false;
        if (showGridlines === false) {
            this.showGridlines = false;
        }
        this.darkHightlight = darkHightlight;

        if (definition) {
            this.correctCanvasDefinition(definition);
            this.initShapes(elementId, options, definition.drawingShapes);
        }
    }

    destroy() {
        try {
            if (this.canvasObject)
                this.canvasObject.dispose();
        } catch (err) { }
    }

    setCanvasMarginLeft(marginLeft?: number) {
        let marginLeftString = marginLeft ? marginLeft + 'px' : '';
        this.canvasObject.getElement().style.marginLeft = marginLeftString;
        this.canvasObject.getSelectionElement().style.marginLeft = marginLeftString;
    }

    getCanvasMarginLeft() {
        let marginLeft = this.canvasObject.getElement().style.marginLeft;
        return Utils.isNullOrEmpty(marginLeft) ? 0 : parseInt(marginLeft.replace('px', ''));
    }

    setSelectingShapeCallback(onSelectingShape: (shape: DrawingShape) => void) {
        this.onSelectingShape = onSelectingShape;
        this.onSelectingShape(null);
    }

    setSelectShapeEventWithCallback(onSelectShape: (shape: DrawingShape) => void) {
        this.canvasObject.on('mouse:up', (options) => {
            onSelectShape(this.findDrawingShape(options.target));
        });
    }

    getCanvasDefinitionJson(): CanvasDefinition {
        let shapes: DrawingShape[] = [];
        this.drawingShapes.forEach(s => shapes.push(Object.assign({}, s)));

        shapes.forEach((s, index) => {
            s.shape = (s.shape as Shape).getShapeJson()
            this.drawingShapes[index].shape.nodes = s.shape.nodes;
        });

        if (this.onSelectingShape) {
            this.onSelectingShape(this.findDrawingShape(this.canvasObject.getActiveObject()));
        }

        return {
            backgroundImageUrl: this.backgroundImageUrl,
            width: this.width,
            height: this.height,
            gridX: this.gridX,
            gridY: this.gridY,
            drawingShapes: shapes
        }
    }

    setSelectedShapeItemId(shapeIdentityId: GuidValue) {
        this.selectedShape = { id: shapeIdentityId };
        this.updateSelectedShapeStyle();
    }

    private updateSelectedShapeStyle() {
        this.drawingShapes.forEach(s => (s.shape as Shape).setSelectedShape(false));
        if (this.selectedShape == null)
            return;
        let drawingShape: DrawingShape = this.drawingShapes.find(s => (s as ProcessStepDrawingShape).processStepId == this.selectedShape.id);
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

        if (this.showGridlines) {
            if (this.gridX) {
                for (var i = 0; i < (this.width / this.gridX); i++) {
                    this.canvasObject.add(new fabric.Line([i * this.gridX, 0, i * this.gridX, this.height], { stroke: this.lineColor, selectable: false, moveCursor: 'auto', hoverCursor: 'auto' }));
                }
                this.canvasObject.add(new fabric.Line([this.width - 1, 0, this.width - 1, this.height], { stroke: this.lineColor, selectable: false, moveCursor: 'auto', hoverCursor: 'auto' }));
            }
            if (this.gridY) {
                for (var i = 0; i < (this.height / this.gridY); i++) {
                    this.canvasObject.add(new fabric.Line([0, i * this.gridY, this.width, i * this.gridY], { stroke: this.lineColor, selectable: false, moveCursor: 'auto', hoverCursor: 'auto' }))
                }
                this.canvasObject.add(new fabric.Line([0, this.height - 1, this.width, this.height - 1], { stroke: this.lineColor, selectable: false, moveCursor: 'auto', hoverCursor: 'auto' }));
            }
        }

        if (drawingShapes) {
            this.promises = [];
            drawingShapes.forEach(s => {
                if (ShapeTemplatesDictionary[s.shape.shapeTemplateTypeName]) {
                    this.promises.push(this.addShapeFromTemplateClassName(s));
                }
            })
        }
    }

    renderReady() {
        return new Promise<DrawingShape>((resolve, reject) => {
            Promise.all(this.promises).then(() => {
                resolve();
            }).catch(() => { reject(); })
        })
    }

    private correctDefinition(definition: DrawingShapeDefinition) {
        definition.width = definition.width ? parseFloat(definition.width.toString()) : 0;
        definition.height = definition.height ? parseFloat(definition.height.toString()) : 0;
        definition.fontSize = definition.fontSize ? parseFloat(definition.fontSize.toString()) : 0;
    }

    addShape(id: GuidValue, type: DrawingShapeTypes, definition: DrawingShapeDefinition, title: MultilingualString,
        objectReferenceId?: GuidValue, nodes?: FabricShapeData[], left?: number, top?: number) {
        return new Promise<DrawingShape>((resolve, reject) => {
            let resolved = true;
            if (definition.shapeTemplateId) {
                this.correctDefinition(definition);
                if (this.canvasObject && ShapeTemplatesDictionary[ShapeTemplateType[definition.shapeTemplateType]]) {
                    let drawingShape: DrawingShape = {
                        id: id,
                        type: type,
                        shape: {
                            shapeTemplateTypeName: ShapeTemplateType[definition.shapeTemplateType],
                            nodes: nodes,
                            definition: definition,
                            left: left || 0,
                            top: top || 0
                        },
                        title: title
                    };
                    if (type == DrawingShapeTypes.ProcessStep) {
                        (drawingShape as ProcessStepDrawingShape).processStepId = objectReferenceId;
                    }
                    if (type == DrawingShapeTypes.CustomLink) {
                        (drawingShape as CustomLinkDrawingShape).linkId = objectReferenceId;
                    }
                    if (type == DrawingShapeTypes.ExternalProcessStep) {
                        (drawingShape as ExternalProcessStepDrawingShape).processStepId = objectReferenceId;
                    }
                    resolved = false;
                    this.addShapeFromTemplateClassName(drawingShape).then((readyDrawingShape: DrawingShape) => {
                        resolve(readyDrawingShape);
                    });
                }
            }
            if (resolved) {
                resolve(null);
            }
        });
    }

    reUpdateCanvasSize(readyDrawingShape: DrawingShape) {
        var size = (readyDrawingShape.shape as ShapeExtension).updateShapePosition();
        if (size) {
            this.canvasObject.setHeight(size.height);
            this.canvasObject.setWidth(size.width);
        }
        this.canvasObject.renderAndReset();

    }

    updateShapeNodes(id: GuidValue, definition: DrawingShapeDefinition, title: MultilingualString, isGenerateNewNodes: boolean) {
        return new Promise<DrawingShape>((resolve, reject) => {
            let resolved = true;

            if (definition.shapeTemplateId) {
                let oldShapeIndex = this.drawingShapes.findIndex(s => s.id == id);
                if (oldShapeIndex > -1) {
                    let currentDrawingShape = this.drawingShapes[oldShapeIndex];
                    this.drawingShapes.splice(oldShapeIndex, 1);
                    (currentDrawingShape.shape as Shape).shapeObject.forEach(n => this.canvasObject.remove(n));
                    currentDrawingShape.title = title;
                    currentDrawingShape.shape = {
                        shapeTemplateTypeName: ShapeTemplateType[definition.shapeTemplateType],
                        nodes: isGenerateNewNodes ? null : currentDrawingShape.shape.nodes,
                        definition: definition,
                        left: 0,
                        top: 0
                    };
                    resolved = false;

                    this.addShapeFromTemplateClassName(currentDrawingShape).then((readyDrawingShape: DrawingShape) => {
                        this.reUpdateCanvasSize(readyDrawingShape);
                        resolve(readyDrawingShape);
                    });
                }
            }
            if (resolved) {
                resolve(null);
            }
        });
    }

    updateShapeDefinition(id: GuidValue, definition: DrawingShapeDefinition, title: MultilingualString) {
        let currentDrawingShape = this.drawingShapes.find(s => s.id == id);
        if (currentDrawingShape) {
            (currentDrawingShape.shape as ShapeExtension).updateShapeDefinition(definition, title);
            this.reUpdateCanvasSize(currentDrawingShape);
            currentDrawingShape.title = title;
        }
    }

    updateShape(drawingShape: DrawingShape, drawingOptions: DrawingShapeOptions) {
        return new Promise<DrawingShape>((resolve, reject) => {
            let resolved = true;
            if (!drawingOptions.shapeDefinition.shapeTemplateId)
                return resolve(null);
            let currentLeft = drawingShape.shape.left; let currentTop = drawingShape.shape.top;
            let nodes: FabricShapeData[] = null;
            if (drawingOptions.shape) {
                if (drawingOptions.isUpdatedPosition) {
                    currentLeft = drawingOptions.shape.left;
                    currentTop = drawingOptions.shape.top;
                }
                nodes = drawingOptions.shape.nodes;
            }

            let oldShapeIndex = this.drawingShapes.findIndex(s => s.id == drawingShape.id);
            if (oldShapeIndex > -1) {
                let currentDrawingShape = this.drawingShapes[oldShapeIndex];
                currentDrawingShape = this.updateDrawingShapeObject(currentDrawingShape, drawingOptions);

                if (!drawingOptions.isRenderAndReset) {
                    (currentDrawingShape.shape as ShapeExtension).updateShapeDefinition(drawingOptions.shapeDefinition, drawingOptions.title);
                    this.canvasObject.renderAll();
                    currentDrawingShape.id = Guid.newGuid();
                }
                else {
                    //If this is not freeform, we keep the old position
                    let fabricShapeObject = (currentDrawingShape.shape as Shape).shapeObject[0];
                    if (!drawingOptions.isUpdatedPosition) {
                        currentLeft = fabricShapeObject.left;
                        currentTop = fabricShapeObject.top;
                    }

                    if (nodes && nodes.length > 0)
                        nodes[0].properties.angle = fabricShapeObject.angle;
                    this.drawingShapes.splice(oldShapeIndex, 1);
                    (currentDrawingShape.shape as Shape).shapeObject.forEach(n => this.canvasObject.remove(n));

                    currentDrawingShape.shape = {
                        shapeTemplateTypeName: ShapeTemplateType[drawingOptions.shapeDefinition.shapeTemplateType],
                        nodes: nodes,
                        definition: drawingOptions.shapeDefinition,
                        left: currentLeft,
                        top: currentTop
                    };
                    resolved = false;

                    this.addShapeFromTemplateClassName(currentDrawingShape).then((readyDrawingShape: DrawingShape) => {
                        resolve(readyDrawingShape);
                    });
                }
            }
            else {
                this.addShape(drawingShape.id, drawingOptions.shapeType, drawingOptions.shapeDefinition, drawingOptions.title, drawingOptions.processStepId || drawingOptions.customLinkId || drawingOptions.externalProcesStepId, nodes);
            }

            if (resolved) {
                resolve(null);
            }
        });
    }

    protected addShapeFromTemplateClassName(drawingShape: DrawingShape) {
        let readyDrawingShape: DrawingShape = Utils.clone(drawingShape);

        let newShape = ShapeFactory.createService(ShapeTemplatesDictionary[ShapeTemplateType[readyDrawingShape.shape.definition.shapeTemplateType]], readyDrawingShape.shape.definition,
            readyDrawingShape.shape.nodes, readyDrawingShape.title, this.selectable, readyDrawingShape.shape.left, readyDrawingShape.shape.top, this.darkHightlight);

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
        if (!this.canvasObject.getContext())
            return;
        newShape.setAllowHover(this.isSetHover);
        newShape.addEventListener(this.canvasObject, this.gridX, this.gridY);
        newShape.shapeObject.forEach(s => {
            this.canvasObject.add(s);
        });
        drawingShape.shape = newShape;
        this.drawingShapes.push(drawingShape);
    }

    private updateDrawingShapeObject(currentDrawingShape: DrawingShape, drawingOptions: DrawingShapeOptions) {
        delete (currentDrawingShape as ProcessStepDrawingShape).processStepId;
        delete (currentDrawingShape as CustomLinkDrawingShape).linkId;
        delete (currentDrawingShape as ExternalProcessStepDrawingShape).processStepId;
        currentDrawingShape.title = drawingOptions.title;
        currentDrawingShape.type = drawingOptions.shapeType;
        if (drawingOptions.shapeType == DrawingShapeTypes.ProcessStep) {
            (currentDrawingShape as ProcessStepDrawingShape).processStepId = drawingOptions.processStepId;
        }
        if (drawingOptions.shapeType == DrawingShapeTypes.CustomLink) {
            (currentDrawingShape as CustomLinkDrawingShape).linkId = drawingOptions.customLinkId;
        }
        if (drawingOptions.shapeType == DrawingShapeTypes.ExternalProcessStep) {
            (currentDrawingShape as ExternalProcessStepDrawingShape).processStepId = drawingOptions.externalProcesStepId;
        }
        return currentDrawingShape;
    }
}

const ShapeTemplatesDictionary = {
    CircleShape,
    DiamondShape,
    PentagonShape,
    MediaShape,
    FreeformShape,
    RectShape
}
