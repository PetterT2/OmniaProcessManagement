import { fabric } from 'fabric';
import { Shape } from './Shape';
import { TextSpacingWithShape, ShapeTemplatesConstants } from '../../../constants';
import { FabricShapeExtention, FabricShapeNodeTypes, FabricRectShape, FabricTextShape, IShapeNode } from '../fabricshape';
import { DrawingShapeDefinition, TextPosition } from '../../data';
import { IShape } from './IShape';

export class DiamondShape implements Shape {
    definition: DrawingShapeDefinition;
    nodes: IShapeNode[];
    private fabricShapes: Array<FabricShapeExtention> = [];
    private fabricObjects: fabric.Object[] = [];
    private startPoint: { x: number, y: number } = { x: 0, y: 0 };
    private originPos: { x: number, y: number } = { x: 0, y: 0 };

    constructor(definition: DrawingShapeDefinition, nodes?: IShapeNode[], isActive?: boolean, text?: string, selectable?: boolean,
        left?: number, top?: number) {
        this.definition = definition;
        this.definition.height = this.definition.width;
        this.nodes = nodes;
        this.initNodes(isActive || false, text, selectable, left, top);
    }

    get name() {
        return ShapeTemplatesConstants.Diamond.name;
    }

    ready(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            resolve(true);
        })
    }

    private initNodes(isActive: boolean, text?: string, selectable?: boolean, left?: number, top?: number) {
        this.startPoint = { x: 0, y: 0 };
        this.originPos = { x: 0, y: 0 };
        this.fabricShapes = [];
        if (this.nodes) {
            let rectNode = this.nodes.find(n => n.shapeNodeType == FabricShapeNodeTypes.rect);
            let textNode = this.nodes.find(n => n.shapeNodeType == FabricShapeNodeTypes.text);
            if (rectNode)
                this.fabricShapes.push(new FabricRectShape(this.definition, isActive, Object.assign({ selectable: selectable }, rectNode.properties || {})));
            if (textNode)
                this.fabricShapes.push(new FabricTextShape(this.definition, isActive, Object.assign({ selectable: false }, textNode.properties) || {}));
        }
        else if (this.definition) {
            let diamondWidth = Math.floor(Math.sqrt(Math.pow(this.definition.width, 2) / 2));
            left = left || 0; top = top || 0;
            left = parseFloat(left.toString());
            left = left - diamondWidth;
            if (left < 0) left = 0;
            top = parseFloat(top.toString());
            let recleft = this.definition.width + left, rectop = top, tleft = left + diamondWidth + (this.definition.width - diamondWidth), ttop = top;
            switch (this.definition.textPosition) {
                case TextPosition.Center:
                    ttop = top + Math.floor(Math.sqrt(Math.pow(this.definition.width, 2) / 2) - this.definition.fontSize / 2 - 2);
                    break;
                case TextPosition.Bottom:
                    ttop += Math.floor(Math.sqrt(Math.pow(this.definition.width, 2) * 2)) + TextSpacingWithShape;
                    break;
                default:
                    rectop += this.definition.fontSize + TextSpacingWithShape;
                    break;
            }
            this.fabricShapes.push(new FabricRectShape(this.definition, isActive, { left: recleft, top: rectop, angle: 45, selectable: selectable }));
            this.fabricShapes.push(new FabricTextShape(this.definition, isActive, { originX: 'center', left: tleft, top: ttop, selectable: false, text: text || "Sample Text" }));
        }
        this.fabricShapes.forEach(s => this.fabricObjects.push(s.fabricObject));
        this.nodes = this.fabricShapes.map(n => n.getShapeNodeJson());
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
            "scaling": (e) => {
                this.fabricObjects[1].set({
                    left: (e.target.left - left0) + left,
                    top: (e.target.top - top0) + top,
                });
            }
        })


    }

}
