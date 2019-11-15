import { fabric } from 'fabric';
import { Shape } from './Shape';
import { FabricShapeNodeTypes, FabricShapeExtention, FabricCircleShape, IShapeNode } from '../fabricshape';
import { DrawingShapeDefinition, TextPosition } from '../../data';
import { IShape } from './IShape';
import { FabricEllipseShape } from '../fabricshape/FabricEllipseShape';
import { FabricTextShape } from '../fabricshape/FabricTextShape';
import { TextSpacingWithShape, ShapeTemplatesConstants } from '../../../constants';

export class CircleShape implements Shape {
    nodes: IShapeNode[];
    private fabricShapes: Array<FabricShapeExtention> = [];
    private fabricObjects: fabric.Object[] = [];

    constructor(definition: DrawingShapeDefinition, nodes?: IShapeNode[], text?: string, selectable?: boolean, left?: number, top?: number) {
        this.initNodes(definition, nodes, text, selectable, left, top);
    }

    get name() {
        return ShapeTemplatesConstants.Circle.name;
    }

    private initNodes(definition: DrawingShapeDefinition, nodes?: IShapeNode[], text?: string, selectable?: boolean, left?: number, top?: number) {
        this.fabricShapes = [];
        if (nodes) {
            let circleNode = nodes.find(n => n.shapeNodeType == FabricShapeNodeTypes.circle);
            let ellipseNode = nodes.find(n => n.shapeNodeType == FabricShapeNodeTypes.ellipse);
            let textNode = nodes.find(n => n.shapeNodeType == FabricShapeNodeTypes.text);
            if (circleNode) {
                this.fabricShapes.push(new FabricCircleShape(definition, Object.assign({ selectable: selectable }, circleNode.properties || {})));
            }
            if (ellipseNode) {
                this.fabricShapes.push(new FabricEllipseShape(definition, Object.assign({ selectable: selectable }, ellipseNode.properties || {})));
            }
            if (textNode) {
                this.fabricShapes.push(new FabricTextShape(definition, Object.assign({ selectable: selectable }, textNode.properties || {})));
            }
        }
        else if (definition) {
            left = left || 0; top = top || 0;
            let cleft = left, ctop = top, tleft = left + Math.floor(definition.width / 2), ttop = top;
            switch (definition.textPosition) {
                case TextPosition.Center:
                    tleft += TextSpacingWithShape;
                    ttop += Math.floor(definition.height / 2 - definition.fontSize / 2 - 2);
                    break;
                case TextPosition.Bottom:
                    ttop += definition.height + TextSpacingWithShape;
                    break;
                default:
                    ctop += definition.fontSize + TextSpacingWithShape;
                    break;
            }
            this.fabricShapes.push(new FabricCircleShape(definition, { left: cleft, top: ctop, selectable: selectable }));
            this.fabricShapes.push(new FabricTextShape(definition, { left: tleft, top: ttop, selectable: selectable, text: text || "Sample Text" }));
        }
        this.fabricShapes.forEach(s => this.fabricObjects.push(s.fabricObject));
    }

    get shapeObject(): fabric.Object[] {
        return this.fabricObjects;
    }

    getShape(): IShape {
        return {
            name: this.name,
            nodes: this.fabricShapes ? this.fabricShapes.map(n => n.getShapeNode()) : []
        }
    }
}
