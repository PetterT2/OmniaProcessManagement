import { fabric } from 'fabric';
import { Shape } from './Shape';
import { FabricShapeNodeTypes, FabricShapeExtention, FabricCircleShape, IShapeNode } from '../fabricshape';
import { DrawingShapeDefinition, TextPosition } from '../../data';
import { IShape } from './IShape';
import { FabricEllipseShape } from '../fabricshape/FabricEllipseShape';
import { FabricTextShape } from '../fabricshape/FabricTextShape';
import { TextSpacingWithShape, ShapeTemplatesConstants } from '../../../constants';

export class CircleShape implements Shape {
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
        return ShapeTemplatesConstants.Circle.name;
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
            let circleNode = this.nodes.find(n => n.shapeNodeType == FabricShapeNodeTypes.circle);
            let ellipseNode = this.nodes.find(n => n.shapeNodeType == FabricShapeNodeTypes.ellipse);
            let textNode = this.nodes.find(n => n.shapeNodeType == FabricShapeNodeTypes.text);
            if (circleNode) {
                this.fabricShapes.push(new FabricCircleShape(this.definition, isActive, Object.assign({ selectable: selectable }, circleNode.properties || {})));
            }
            if (ellipseNode) {
                this.fabricShapes.push(new FabricEllipseShape(this.definition, isActive, Object.assign({ selectable: selectable }, ellipseNode.properties || {})));
            }
            if (textNode) {
                this.fabricShapes.push(new FabricTextShape(this.definition, isActive, Object.assign({ selectable: false }, textNode.properties || {})));
            }
        }
        else if (this.definition) {
            left = left || 0; top = top || 0;
            left = parseFloat(left.toString());
            top = parseFloat(top.toString());
            let cleft = left, ctop = top, tleft = left + Math.floor(this.definition.width / 2), ttop = top;
            switch (this.definition.textPosition) {
                case TextPosition.Center:
                    ttop += Math.floor(this.definition.width / 2 - this.definition.fontSize / 2 - 2);
                    break;
                case TextPosition.Bottom:
                    ttop += this.definition.width + TextSpacingWithShape;
                    break;
                default:
                    ctop += this.definition.fontSize + TextSpacingWithShape;
                    break;
            }
            this.fabricShapes.push(new FabricCircleShape(this.definition, isActive, { left: cleft, top: ctop, selectable: selectable }));
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
