import { fabric } from 'fabric';
import { DrawingCanvas } from './DrawingCanvas';
import { Shape } from '../shapes';
import { CanvasDefinition, DrawingShape, DrawingShapeTypes } from '../../models/data/drawingdefinitions';
import { Utils } from '@omnia/fx';
import { DrawingShapeDefinition } from '../../models';
import { GuidValue, MultilingualString } from '@omnia/fx-models';
import { DrawingShapeOptions } from '../../../models/processdesigner';
import { IFabricShape } from '../fabricshape';

export class DrawingCanvasEditor extends DrawingCanvas implements CanvasDefinition {
    private onClickEditShapeSettings: (drawingShape: DrawingShape) => void;
    private onDrawingChanged: () => void;
    private editObject: fabric.Object;
    private isMoving: boolean = false;

    constructor(elementId: string, options: fabric.ICanvasOptions, definition: CanvasDefinition, isSetHover?: boolean, onClickEditShapeSettings?: (drawingShape: DrawingShape) => void, onDrawingChanged?: () => void) {
        super(elementId, Object.assign({ preserveObjectStacking: true }, options || {}), definition, isSetHover);
        this.onClickEditShapeSettings = onClickEditShapeSettings;
        this.onDrawingChanged = onDrawingChanged;
    }

    protected initShapes(elementId: string, options: fabric.ICanvasOptions, drawingShapes: DrawingShape[]) {
        this.selectable = true;
        this.renderCanvas(elementId, options, drawingShapes);
        this.addEventListener();
    }

    protected setActiveObject(drawingShapeResult: DrawingShape) {
        if (drawingShapeResult) {
            this.canvasObject.setActiveObject((drawingShapeResult.shape as Shape).shapeObject[0]);
        }
    }

    updateShapeDefinition(id: GuidValue, definition: DrawingShapeDefinition, title: MultilingualString, left?: number, top?: number) {
        return new Promise<DrawingShape>((resolve, reject) => {
            super.updateShapeDefinition(id, definition, title, left, top).then((drawingShapeResult: DrawingShape) => {
                this.setActiveObject(drawingShapeResult);
                resolve();
            }).catch(reject);

        });
    }

    updateShape(drawingShape: DrawingShape, drawingOptions: DrawingShapeOptions) {
        return new Promise<DrawingShape>((resolve, reject) => {
            super.updateShape(drawingShape, drawingOptions).then((drawingShapeResult: DrawingShape) => {
                this.setActiveObject(drawingShapeResult);
                resolve();
            }).catch(reject);

        });
    }

    addShape(id: GuidValue, type: DrawingShapeTypes, definition: DrawingShapeDefinition,
        title: MultilingualString, left?: number, top?: number,
        processStepId?: GuidValue, customLinkId?: GuidValue, nodes?: IFabricShape[]) {
        return new Promise<DrawingShape>((resolve, reject) => {
            super.addShape(id, type, definition, title, left, top, processStepId, customLinkId, nodes).then((drawingShapeResult: DrawingShape) => {
                this.setActiveObject(drawingShapeResult);
                resolve();
            }).catch(reject);

        });
    }

    private addEditIcon(object: fabric.Object) {
        if (object && object.aCoords) {
            let ctx = this.canvasObject.getContext();
            setTimeout(() => {
                ctx.font = '900 30px "Font Awesome 5 Pro"';
                ctx.fillStyle = "grey";
                ctx.fillText("\uF111", object.aCoords.tr.x - 30, object.aCoords.tr.y + 28);
                ctx.font = '900 14px "Font Awesome 5 Pro"';
                ctx.fillStyle = "white";
                ctx.fillText("\uF040", object.aCoords.tr.x - 21, object.aCoords.tr.y + 20);
                this.editObject = object;
            }, 0);
        }
    }

    protected addEventListener() {
        if (this.canvasObject == null)
            return;

        let ctx = this.canvasObject.getContext();
        ctx.font = '900 0px "Font Awesome 5 Pro"';
        ctx.fillText("", 0, 0);

        this.canvasObject.on('object:moving', (options) => {
            let object = options.target;
            let drawingShape = this.findDrawingShape(object);
            if (drawingShape && (drawingShape.shape as Shape).shapeObject) {
                if (options.target.type == 'text') {
                    object = (drawingShape.shape as Shape).shapeObject[0];
                    this.canvasObject.setActiveObject(object);
                }
            }
            if (this.gridX)
                object.set({
                    left: Math.round(object.left / this.gridX) * this.gridX
                });
            if (this.gridY)
                object.set({
                    top: Math.round(object.top / this.gridY) * this.gridY
                });
            this.isMoving = true;
        });

        this.canvasObject.on('mouse:down', (options) => {
            if (options.target) {
                let object = options.target;
                let drawingShape = this.findDrawingShape(object);
                if (drawingShape && (drawingShape.shape as Shape).shapeObject) {
                    if (options.target.type == 'text') {
                        object = (drawingShape.shape as Shape).shapeObject[0];
                        this.canvasObject.setActiveObject(object);
                    }
                    this.addEditIcon(object);
                }
            }
        });

        this.canvasObject.on('mouse:up', (options) => {
            if (options.target) {
                let object = options.target;
                let drawingShape = this.findDrawingShape(object);
                if (drawingShape && (drawingShape.shape as Shape).shapeObject) {
                    if (options.target.type == 'text') {
                        object = (drawingShape.shape as Shape).shapeObject[0];
                        this.canvasObject.setActiveObject(object);
                        this.canvasObject.renderAll();
                    }
                    this.addEditIcon(object);
                }
            }
            if (this.editObject) {
                var currPos = this.canvasObject.getPointer(options.e);
                if (currPos.x < this.editObject.aCoords.tr.x && currPos.x > (this.editObject.aCoords.tr.x - 30)
                    && currPos.y > this.editObject.aCoords.tr.y && currPos.y < (this.editObject.aCoords.tr.y + 28)) {
                    if (this.onClickEditShapeSettings) {
                        this.onClickEditShapeSettings(this.findDrawingShape(this.editObject));
                    }
                    this.canvasObject.setActiveObject(this.editObject);
                }
            }
            if (this.onSelectingShape) {
                this.onSelectingShape(this.findDrawingShape(this.canvasObject.getActiveObject()));
            }
            if (this.isMoving) {
                this.isMoving = false;
                if (this.onDrawingChanged) {
                    this.onDrawingChanged();
                }
            }
        });

        this.canvasObject.on('object:scaled', (options) => {
            if (this.onDrawingChanged) {
                this.onDrawingChanged();
            }
        });

        this.canvasObject.on('object:selected', (options) => {
            if (options.target && this.onSelectingShape) {
                this.onSelectingShape(this.findDrawingShape(this.canvasObject.getActiveObject()));
            }
        });
    }

}
