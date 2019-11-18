﻿import { fabric } from 'fabric';
import { Shape } from './Shape';
import { ShapeTemplatesConstants, TextSpacingWithShape } from '../../../constants';
import { FabricShapeExtention, FabricShapeNodeTypes, FabricRectShape, FabricTextShape, FabricTriangleShape, IShapeNode } from '../fabricshape';
import { DrawingShapeDefinition, TextPosition } from '../../data';
import { IShape } from './IShape';

export class PentagonShape implements Shape {
    definition: DrawingShapeDefinition;
    nodes: IShapeNode[];
    private fabricShapes: Array<FabricShapeExtention> = [];
    private fabricObjects: fabric.Object[] = [];
    private startPoint: { x: number, y: number } = { x: 0, y: 0 };
    private originPos: { x: number, y: number } = { x: 0, y: 0 };

    constructor(definition: DrawingShapeDefinition, nodes?: IShapeNode[], text?: string, selectable?: boolean, left?: number, top?: number) {
        this.definition = definition;
        this.nodes = nodes;
        this.initNodes(text, selectable, left, top);
    }

    get name() {
        return ShapeTemplatesConstants.Pentagon.name;
    }

    private initNodes(text?: string, selectable?: boolean, left?: number, top?: number) {
        this.startPoint = { x: 0, y: 0 };
        this.originPos = { x: 0, y: 0 };
        this.fabricShapes = [];
        var fabricGroupObjects: fabric.Object[] = [];
        var fabricTextObject: fabric.Object;
        if (this.nodes) {
            let rectNode = this.nodes.find(n => n.shapeNodeType == FabricShapeNodeTypes.rect);
            let triangleNode = this.nodes.find(n => n.shapeNodeType == FabricShapeNodeTypes.triangle);
            let textNode = this.nodes.find(n => n.shapeNodeType == FabricShapeNodeTypes.text);
            if (rectNode) {
                let rectShape = new FabricRectShape(this.definition, Object.assign({ selectable: selectable }, rectNode.properties || {}));
                this.fabricShapes.push(rectShape);
                fabricGroupObjects.push(rectShape.fabricObject);
            }
            if (triangleNode) {
                let triangleShape = new FabricTriangleShape(this.definition, Object.assign({ selectable: selectable }, triangleNode.properties || {}));
                this.fabricShapes.push(triangleShape);
                fabricGroupObjects.push(triangleShape.fabricObject);
            }
            if (textNode) {
                let textShape = new FabricTextShape(this.definition, Object.assign({ selectable: selectable }, textNode.properties || {}));
                this.fabricShapes.push(textShape);
                fabricTextObject = textShape.fabricObject;
            }
        }
        else if (this.definition) {
            left = left || 0; top = top || 0;
            let triangleWidth = Math.floor(this.definition.height / 2);
            let triangleDefinition: DrawingShapeDefinition = Object.assign({}, this.definition);
            triangleDefinition.width = this.definition.height + 1;
            triangleDefinition.height = triangleWidth - 0.5;
            let recDefinition: DrawingShapeDefinition = Object.assign({}, this.definition);
            recDefinition.width = this.definition.width - triangleWidth;
            let recleft = left, rectop = top, tleft = left + Math.floor(recDefinition.width / 2),
                ttop = top, trleft = this.definition.width + left, trtop = top;

            switch (this.definition.textPosition) {
                case TextPosition.Center:
                    tleft += TextSpacingWithShape;
                    ttop += Math.floor(this.definition.height / 2 - this.definition.fontSize / 2 - 2);
                    break;
                case TextPosition.Bottom:
                    ttop += this.definition.height + TextSpacingWithShape;
                    break;
                default:
                    rectop += this.definition.fontSize + TextSpacingWithShape;
                    trtop = rectop - 1;
                    break;
            }

            this.fabricShapes.push(new FabricRectShape(recDefinition, { left: recleft, top: rectop, selectable: selectable }));
            this.fabricShapes.push(new FabricTriangleShape(triangleDefinition, { left: trleft, top: trtop, selectable: selectable, angle: 90 }));
            this.fabricShapes.push(new FabricTextShape(this.definition, { left: tleft, top: ttop, selectable: selectable, text: text || "Sample Text" }));

            fabricGroupObjects = [this.fabricShapes[0].fabricObject, this.fabricShapes[1].fabricObject];
            fabricTextObject = this.fabricShapes[2].fabricObject;
        }
        this.fabricObjects.push(new fabric.Group(fabricGroupObjects, { selectable: selectable }));
        this.fabricObjects.push(fabricTextObject);
        this.nodes = this.fabricShapes.map(n => n.getShapeNode());
    }

    get shapeObject(): fabric.Object[] {
        return this.fabricObjects;
    }

    getShape(): IShape {
        return {
            name: this.name,
            nodes: this.fabricShapes ? this.fabricShapes.map(n => n.getShapeNode()) : [],
            definition: this.definition
        }
    }    

    addListenerEvent(canvas: fabric.Canvas, gridX?: number, gridY?: number) {
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
            "scaling": (e) => {
                this.fabricObjects[1].set({
                    left: (e.target.left - left0) + left,
                    top: (e.target.top - top0) + top,
                });
            }
        })

    }

}
