import { fabric } from 'fabric';
import { DrawingCanvas } from './DrawingCanvas';
import { Shape } from '../shapes';
import { CanvasDefinition, DrawingShape, DrawingShapeTypes } from '../../models/data/drawingdefinitions';
import { Utils } from '@omnia/fx';
import { DrawingShapeDefinition } from '../../models';
import { GuidValue, MultilingualString } from '@omnia/fx-models';
import { DrawingShapeOptions } from '../../../models/processdesigner';
import { FabricShapeData } from '../fabricshape';

export class DrawingCanvasEditor extends DrawingCanvas implements CanvasDefinition {
    private onClickEditShapeSettings: (drawingShape: DrawingShape) => void;
    private onDrawingChanged: (refreshSettingsPanel?: boolean) => void;
    private editObject: fabric.Object;
    private isMoving: boolean = false;
    private isScaling: boolean = false;
    private editIconPosition: { tl: fabric.Point, width: number, isHover: boolean };

    constructor(elementId: string, options: fabric.ICanvasOptions, definition: CanvasDefinition, isSetHover?: boolean,
        onClickEditShapeSettings?: (drawingShape: DrawingShape) => void,
        onDrawingChanged?: (refreshSettingsPanel?: boolean) => void,
        showGridlines?: boolean, darkHightlight?: boolean) {
        super(elementId, Object.assign({ preserveObjectStacking: true }, options || {}), definition, isSetHover, showGridlines, darkHightlight);
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

    updateShapeNodes(id: GuidValue, definition: DrawingShapeDefinition, title: MultilingualString, isGenerateNewNodes: boolean) {
        return new Promise<DrawingShape>((resolve, reject) => {
            super.updateShapeNodes(id, definition, title, isGenerateNewNodes).then((drawingShapeResult: DrawingShape) => {
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
        title: MultilingualString, objectReferenceId?: GuidValue, nodes?: FabricShapeData[], left?: number, top?: number) {
        return new Promise<DrawingShape>((resolve, reject) => {
            super.addShape(id, type, definition, title, objectReferenceId, nodes, left, top).then((drawingShapeResult: DrawingShape) => {
                this.setActiveObject(drawingShapeResult);
                resolve();
            }).catch(reject);

        });
    }

    deleteShape(shape: DrawingShape) {
        let findIndex = this.drawingShapes.findIndex(s => s.id == shape.id);
        if (findIndex > -1) {
            this.drawingShapes.splice(findIndex, 1);
            (shape.shape as Shape).shapeObject.forEach(n => this.canvasObject.remove(n));
            this.editObject = null;
            this.editIconPosition = null;
        }
    }

    private addEditIcon(isHover?: boolean) {
        if (this.editObject && this.editObject.aCoords) {
            let x = this.editObject.aCoords.tr.x;
            let y = this.editObject.aCoords.tr.y;
            if (this.editObject.angle < 315 && this.editObject.angle > 225) {
                x = this.editObject.aCoords.br.x;
                y = this.editObject.aCoords.br.y;
            }
            if (this.editObject.angle <= 225 && this.editObject.angle > 115) {
                x = this.editObject.aCoords.bl.x;
                y = this.editObject.aCoords.bl.y;
            }
            if (this.editObject.angle <= 115 && this.editObject.angle > 45) {
                x = this.editObject.aCoords.tl.x;
                y = this.editObject.aCoords.tl.y;
            }
            this.editIconPosition = {
                tl: new fabric.Point(x - 30, y + 28), width: 30, isHover: isHover
            };
            let ctx = this.canvasObject.getContext();
            ctx.font = '900 30px "Font Awesome 5 Pro"';
            ctx.fillStyle = isHover ? "darkgrey" : "grey";
            ctx.fillText("\uF111", this.editIconPosition.tl.x, this.editIconPosition.tl.y);
            ctx.font = '900 14px "Font Awesome 5 Pro"';
            ctx.fillStyle = "white";
            ctx.fillText("\uF040", this.editIconPosition.tl.x + 9, this.editIconPosition.tl.y - 8);
        }

    }

    private clearEditIcon() {
        if (this.editIconPosition) {
            this.canvasObject.renderAll();
        }
    }

    protected onMovingListener() {
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
            let ctx = this.canvasObject.getContext();
            ctx.font = '900 30px "Font Awesome 5 Pro"';
            ctx.fillStyle = "grey";
            ctx.fillText("\uF111", 0, 0);
        });


    }

    private isInEditZoneIcon(options: fabric.IEvent) {
        if (options && options.e) {
            var currPos = this.canvasObject.getPointer(options.e);
            return this.editIconPosition && currPos.x > this.editIconPosition.tl.x && currPos.x < (this.editIconPosition.tl.x + this.editIconPosition.width)
                && currPos.y < this.editIconPosition.tl.y && currPos.y > (this.editIconPosition.tl.y - this.editIconPosition.width);
        }
        return false;
    }

    protected addEventListener() {
        if (this.canvasObject == null)
            return;

        let ctx = this.canvasObject.getContext();
        ctx.font = '900 0px "Font Awesome 5 Pro"';
        ctx.fillText("", 0, 0);
        this.onMovingListener();
        this.canvasObject.on('mouse:down', (options) => {
            if (options.target) {
                let object = options.target;
                let drawingShape = this.findDrawingShape(object);
                if (drawingShape && (drawingShape.shape as Shape).shapeObject) {
                    if (options.target.type == 'text') {
                        object = (drawingShape.shape as Shape).shapeObject[0];
                        this.canvasObject.setActiveObject(object);
                    }
                    this.editObject = object;
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
                    this.editObject = object;
                }
            } else if (!this.isInEditZoneIcon(options)) {
                this.editObject = null;
                this.editIconPosition = null;
                this.clearEditIcon();
            }
            if (this.editObject && !this.isScaling && this.editIconPosition) {
                if (this.isInEditZoneIcon(options)) {
                    if (this.onClickEditShapeSettings) {
                        this.onClickEditShapeSettings(this.findDrawingShape(this.editObject));
                    }
                    this.canvasObject.setActiveObject(this.editObject);
                    this.canvasObject.renderAll();
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

        this.canvasObject.on('object:scaling', (options) => {
            this.isScaling = true;
        });

        this.canvasObject.on('object:scaled', (options) => {
            if (this.onDrawingChanged) {
                this.onDrawingChanged(true);
            }
            this.isScaling = false;
        });

        this.canvasObject.on('object:rotated', (options) => {
            if (this.onDrawingChanged) {
                this.onDrawingChanged(true);
            }
        });

        this.canvasObject.on('after:render', (options) => {
            if (this.editObject && (this.isInEditZoneIcon(options) || this.canvasObject.getActiveObject()) && !this.isMoving && !this.isScaling) {
                this.addEditIcon();
                if (!this.canvasObject.getActiveObject())
                    this.canvasObject.setActiveObject(this.editObject);
            }
        });

        this.canvasObject.on('mouse:move', (options) => {
            if (!this.editIconPosition)
                return;
            if (this.isInEditZoneIcon(options)) {
                this.addEditIcon(true);
            } else {
                this.addEditIcon();
            }
        });
        //this.canvasObject.on('object:selected', (options) => {
        //    if (options.target && this.onSelectingShape) {
        //        this.onSelectingShape(this.findDrawingShape(this.canvasObject.getActiveObject()));
        //    }
        //});
    }

}
