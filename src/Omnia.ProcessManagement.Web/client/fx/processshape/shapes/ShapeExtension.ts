import { fabric } from 'fabric';
import { Shape } from './Shape';
import { DrawingShapeDefinition, TextPosition } from '../../models';
import { IShape } from './IShape';
import { IFabricShape, FabricShape, FabricShapeTypes } from '../fabricshape';
import { MultilingualString } from '@omnia/fx-models';
import { TextSpacingWithShape } from '../../constants';

export class ShapeExtension implements Shape {
    definition: DrawingShapeDefinition;
    nodes: IFabricShape[];
    left: number;
    top: number;
    protected fabricShapes: Array<FabricShape> = [];
    protected fabricObjects: fabric.Object[] = [];
    protected startPoint: { x: number, y: number } = { x: 0, y: 0 };
    protected originPos: { x: number, y: number } = { x: 0, y: 0 };

    constructor(definition: DrawingShapeDefinition, nodes?: IFabricShape[], isActive?: boolean, title?: MultilingualString | string, selectable?: boolean,
        left?: number, top?: number) {
        this.left = left;
        this.top = top;
        this.definition = definition;
        this.nodes = nodes;
        this.startPoint = { x: 0, y: 0 };
        this.originPos = { x: 0, y: 0 };
        this.fabricShapes = [];
        this.initNodes(isActive || false, title, selectable, left, top);
    }

    get name() {
        return "";
    }

    ready(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            resolve(true);
        })
    }

    protected initNodes(isActive: boolean, title?: MultilingualString | string, selectable?: boolean, left?: number, top?: number) {
    }

    get shapeObject(): fabric.Object[] {
        return this.fabricObjects;
    }

    protected getShapes(): IFabricShape[] {
        return this.fabricShapes ? this.fabricShapes.map(n => n.getShapeNodeJson()) : [];
    }

    getShapeJson(): IShape {
        let nodes = this.getShapes();
        this.definition = this.ensureDefinition(nodes);
        return {
            name: this.name,
            nodes: nodes,
            definition: this.definition,
            left: this.left,
            top: this.top
        }
    }

    private ensureDefinition(jsonNodes: Array<IFabricShape>) {
        if (jsonNodes) {
            let drawingNode = jsonNodes.find((item) => item.shapeNodeType != FabricShapeTypes.text);
            if (drawingNode) {
                this.definition.width = drawingNode.properties.width;
                this.definition.height = drawingNode.properties.height;
            }
        }
        return this.definition;
    }

    finishScaled(object: fabric.Object) {
        let textPosition = this.getObjectPosition(true, object.left, object.top, object.width * object.scaleX, object.height * object.scaleY, true);
        this.fabricObjects[1].set({
            left: textPosition.left,
            top: textPosition.top
        });
    }

    getObjectPosition(isText: boolean, left: number, top: number, width: number, height: number, isCenter?: boolean) {
        left = left || 0; top = top || 0;
        left = parseFloat(left.toString());
        top = parseFloat(top.toString());
        let polygonleft = left, polygontop = top, tleft = isCenter ? left + Math.floor(width / 2) : left + TextSpacingWithShape, ttop = top;
        switch (this.definition.textPosition) {
            case TextPosition.Center:
                ttop += Math.floor(height / 2 - this.definition.fontSize / 2 - 2);
                break;
            case TextPosition.Bottom:
                ttop += height + TextSpacingWithShape;
                break;
            default:
                polygontop += this.definition.fontSize + TextSpacingWithShape;
                break;
        }
        return isText ? { left: tleft, top: ttop } : { left: polygonleft, top: polygontop };
    }

    addEventListener(canvas: fabric.Canvas, gridX?: number, gridY?: number) {
        if (this.fabricObjects.length < 2 || this.fabricObjects.findIndex(f => f == null) > -1)
            return;
        let left = this.fabricObjects[1].left; let top = this.fabricObjects[1].top;
        let left0 = this.fabricObjects[0].left; let top0 = this.fabricObjects[0].top;

        this.fabricObjects[0].on({
            "mousedown": (e) => {
                left = this.fabricObjects[1].left; top = this.fabricObjects[1].top;
                left0 = this.fabricObjects[0].left; top0 = this.fabricObjects[0].top;
                this.startPoint = canvas.getPointer(e.e);
                this.originPos = { x: this.fabricObjects[1].left, y: this.fabricObjects[1].top };
            },
            "moving": (e) => {
                var currPos = canvas.getPointer(e.e),
                    moveX = currPos.x - this.startPoint.x,
                    moveY = currPos.y - this.startPoint.y;

                if (gridX)
                    this.fabricObjects[1].set({
                        left: Math.round(this.fabricObjects[0].left / gridX) * gridX - left0 + left
                    });
                else
                    this.fabricObjects[1].set({
                        left: this.originPos.x + moveX
                    });

                if (gridY)
                    this.fabricObjects[1].set({
                        top: Math.round(this.fabricObjects[0].top / gridY) * gridY - top0 + top
                    });
                else
                    this.fabricObjects[1].set({
                        top: this.originPos.y + moveY
                    });

                this.fabricObjects[1].setCoords();
            },
            "scaled": (e) => {
                this.finishScaled(e.target);
            }
        })

    }

}
