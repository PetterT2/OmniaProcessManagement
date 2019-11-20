﻿import { fabric } from 'fabric';
import { Shape } from './Shape';
import { FabricShapeNodeTypes, FabricShapeExtention, FabricCircleShape, IShapeNode, FabricImageShape } from '../fabricshape';
import { DrawingShapeDefinition, TextPosition } from '../../data';
import { IShape } from './IShape';
import { FabricEllipseShape } from '../fabricshape/FabricEllipseShape';
import { FabricTextShape } from '../fabricshape/FabricTextShape';
import { TextSpacingWithShape, ShapeTemplatesConstants } from '../../../constants';
import { resolve } from 'path';

export class MediaShape implements Shape {
    definition: DrawingShapeDefinition;
    nodes: IShapeNode[];
    private fabricShapes: Array<FabricShapeExtention> = [];
    private fabricObjects: fabric.Object[] = [];
    private startPoint: { x: number, y: number } = { x: 0, y: 0 };
    private originPos: { x: number, y: number } = { x: 0, y: 0 };

    constructor(definition: DrawingShapeDefinition, nodes?: IShapeNode[], isActive?: boolean, text?: string, selectable?: boolean,
        left?: number, top?: number) {
        this.definition = definition;
        this.nodes = nodes;
        this.initNodes(isActive || false, text, selectable, left, top);
    }

    get name() {
        return ShapeTemplatesConstants.Media.name;
    }

    ready(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            let fabricImageObj = this.fabricShapes.find(f => f.shapeNodeType == FabricShapeNodeTypes.image);
            if (fabricImageObj) {
                (fabricImageObj as FabricImageShape).ready()
                    .then(() => {
                        this.fabricShapes.forEach(s => this.fabricObjects.push(s.fabricObject));
                        this.nodes = this.fabricShapes.map(n => n.getShapeNodeJson());
                        resolve(true);
                    }).catch(() => {
                        reject();
                    });
            }
        })
    }

    private initNodes(isActive: boolean, text?: string, selectable?: boolean, left?: number, top?: number) {
        this.startPoint = { x: 0, y: 0 };
        this.originPos = { x: 0, y: 0 };
        this.fabricShapes = [];
        if (this.nodes) {
            let imageNode = this.nodes.find(n => n.shapeNodeType == FabricShapeNodeTypes.image);
            let textNode = this.nodes.find(n => n.shapeNodeType == FabricShapeNodeTypes.text);
            if (imageNode) {
                this.fabricShapes.push(new FabricImageShape(this.definition, isActive, Object.assign({ selectable: selectable }, imageNode.properties || {})));
            }
            if (textNode)
                this.fabricShapes.push(new FabricTextShape(this.definition, isActive, Object.assign({ selectable: false }, textNode.properties) || {}));
        }
        else if (this.definition) {
            left = left || 0; top = top || 0;
            left = parseFloat(left.toString());
            top = parseFloat(top.toString());
            let cleft = left, ctop = top, tleft = left + Math.floor(this.definition.width / 2), ttop = top;
            switch (this.definition.textPosition) {
                case TextPosition.Center:
                    tleft += TextSpacingWithShape;
                    ttop += Math.floor(this.definition.height / 2 - this.definition.fontSize / 2 - 2);
                    break;
                case TextPosition.Bottom:
                    ttop += this.definition.height + TextSpacingWithShape;
                    break;
                default:
                    ctop += this.definition.fontSize + TextSpacingWithShape;
                    break;
            }
            this.fabricShapes.push(new FabricImageShape(this.definition, isActive, { left: cleft, top: ctop, selectable: selectable }));
            this.fabricShapes.push(new FabricTextShape(this.definition, isActive, { originX: 'center', left: tleft, top: ttop, selectable: false, text: text || "Sample Text" }));
        }

    }

    get shapeObject(): fabric.Object[] {
        return this.fabricObjects;
    }

    getShapeJson(): IShape {
        return {
            name: this.name,
            nodes: this.fabricShapes ? this.fabricShapes.map(n => n.getShapeNodeJson()) : [],
            definition: this.definition
        }
    }

    addEventListener(canvas: fabric.Canvas, gridX?: number, gridY?: number) {
        if (this.fabricObjects.length < 2 || this.fabricObjects.findIndex(f => f == null) > -1)
            return;
        let left = this.fabricObjects[1].left; let top = this.fabricObjects[1].top;
        let left0 = this.fabricObjects[0].left; let top0 = this.fabricObjects[0].top;
        this.fabricObjects[0].on({
            "mousedown": (e) => {
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
            "scaling": (p) => {

            }
        })

    }
}
