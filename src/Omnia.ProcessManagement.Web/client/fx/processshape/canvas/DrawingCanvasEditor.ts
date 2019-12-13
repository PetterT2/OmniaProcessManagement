import { fabric } from 'fabric';
import { DrawingCanvas } from './DrawingCanvas';
import { Shape } from '../shapes';
import { CanvasDefinition, DrawingShape } from '../../models/data/drawingdefinitions';
import { Utils } from '@omnia/fx';

export class DrawingCanvasEditor extends DrawingCanvas implements CanvasDefinition {
    callback: (drawingShape: DrawingShape) => void;
    onMoved: () => void;
    private editObject: fabric.Object;
    private isMoving: boolean = false;

    constructor(elementId: string, options?: fabric.ICanvasOptions, definition?: CanvasDefinition, callback?: (drawingShape: DrawingShape) => {}, onMoved?: () => void) {
        super(elementId, Object.assign({ preserveObjectStacking: true }, options || {}), definition);
        this.callback = callback;
        this.onMoved = onMoved;
    }

    protected initShapes(elementId: string, options?: fabric.ICanvasOptions, definition?: CanvasDefinition) {
        this.selectable = true;
        this.renderGridView(elementId, options, definition);
        this.addEventListener(); 
    }

    private addEditIcon(object: fabric.Object) {
        if (object && object.aCoords) {
            let ctx = this.canvasObject.getContext();
            setTimeout(() => {
                ctx.font = '900 30px "Font Awesome 5 Pro"';
                ctx.fillStyle = "grey";
                ctx.fillText("\uF111", object.aCoords.tr.x + 1, object.aCoords.tr.y - 1);
                ctx.font = '900 14px "Font Awesome 5 Pro"';
                ctx.fillStyle = "white";
                ctx.fillText("\uF040", object.aCoords.tr.x + 10, object.aCoords.tr.y - 7);
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
            if (options.target.type != 'text') {
                if (this.gridX)
                    options.target.set({
                        left: Math.round(options.target.left / this.gridX) * this.gridX
                    });
                if (this.gridY)
                    options.target.set({
                        top: Math.round(options.target.top / this.gridY) * this.gridY
                    });
            }
            this.isMoving = true;
        });

        this.canvasObject.on('mouse:up', (options) => {
            if (options.target) {
                let object = options.target;
                if (options.target.type == 'text') {
                    let drawingShape = this.findDrawingShape(object);
                    if (drawingShape && (drawingShape.shape as Shape).shapeObject) {
                        object = (drawingShape.shape as Shape).shapeObject[0];
                        this.canvasObject.setActiveObject(object);
                        this.canvasObject.renderAll();
                    }
                }
                this.addEditIcon(object);
            }
            else if (this.editObject) {
                var currPos = this.canvasObject.getPointer(options.e);
                if (currPos.x > this.editObject.aCoords.tr.x && currPos.x < (this.editObject.aCoords.tr.x + 30)
                    && currPos.y < this.editObject.aCoords.tr.y && currPos.y > (this.editObject.aCoords.tr.y - 30)) {
                    if (this.callback) {
                        this.callback(this.findDrawingShape(this.editObject));
                    }
                    this.canvasObject.setActiveObject(this.editObject);
                    this.addEditIcon(this.editObject);
                    this.canvasObject.renderAll();
                } else
                    this.editObject = null;
            }
            if (this.isMoving) {
                this.isMoving = false;
                if (this.onMoved) {
                    this.onMoved();
                }
            }
        });
    }

}
