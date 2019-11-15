import { fabric } from 'fabric';
import { Shape } from './Shape';
import { TextSpacingWithShape, ShapeTemplatesConstants } from '../../../constants';
import { FabricShapeExtention, FabricShapeNodeTypes, FabricRectShape, FabricTextShape, IShapeNode } from '../fabricshape';
import { DrawingShapeDefinition, TextPosition } from '../../data';
import { IShape } from './IShape';

export class DiamondShape implements Shape {
    nodes: IShapeNode[];
    private fabricShapes: Array<FabricShapeExtention> = [];
    private fabricGroup: fabric.Group;

    constructor(definition: DrawingShapeDefinition, nodes?: IShapeNode[], text?: string, selectable?: boolean, left?: number, top?: number) {
        this.initNodes(definition, nodes, text, selectable, left, top);
    }

    get name() {
        return ShapeTemplatesConstants.Diamond.name;
    }

    private initNodes(definition: DrawingShapeDefinition, nodes?: IShapeNode[], text?: string, selectable?: boolean, left?: number, top?: number) {
        this.fabricShapes = [];
        if (nodes) {
            let rectNode = nodes.find(n => n.shapeNodeType == FabricShapeNodeTypes.rect);
            let textNode = nodes.find(n => n.shapeNodeType == FabricShapeNodeTypes.text);
            if (rectNode)
                this.fabricShapes.push(new FabricRectShape(definition, Object.assign({ selectable: selectable }, rectNode.properties || {})));
            if (textNode)
                this.fabricShapes.push(new FabricTextShape(definition, Object.assign({ selectable: selectable }, textNode.properties) || {}));
        }
        else if (definition) {
            left = left || 0; top = top || 0;
            let recleft = definition.width + left, rectop = top, tleft = left, ttop = top;
            switch (definition.textPosition) {
                case TextPosition.Center:
                    tleft += TextSpacingWithShape;
                    ttop += Math.floor(definition.height / 2 - definition.fontSize / 2 - 2);
                    break;
                case TextPosition.Bottom:
                    ttop += definition.height + TextSpacingWithShape;
                    break;
                default:
                    rectop += definition.fontSize + TextSpacingWithShape;
                    break;
            }
            this.fabricShapes.push(new FabricRectShape(definition, { left: recleft, top: rectop, angle: 45, selectable: selectable  }));
            this.fabricShapes.push(new FabricTextShape(definition, { left: tleft, top: ttop, selectable: selectable , text: text || "Sample Text" }));
        }
        this.fabricGroup = new fabric.Group(this.fabricShapes.map(n => n.fabricObject), { selectable: selectable });
    }

    get shapeObject(): fabric.Group {
        return this.fabricGroup;
    }

    getShape(): IShape {
        return {
            name: this.name,
            nodes: this.fabricShapes ? this.fabricShapes.map(n => n.getShapeNode()) : []
        }
    }
}
