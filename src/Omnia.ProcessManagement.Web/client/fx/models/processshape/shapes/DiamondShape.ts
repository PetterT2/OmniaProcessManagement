import { Shape } from './Shape';
import { ShapeTemplatesConstants, TextSpacingWithShape } from '../../../../core';
import { FabricShapeExtention, FabricShapeNodeTypes, FabricRectShape, FabricTextShape } from '../fabricshape';
import { DrawingShapeDefinition, TextPosition } from '../../data';
import { IShape } from './IShape';

export class DiamondShape implements Shape {
    nodes: FabricShapeExtention[];

    constructor(definition: DrawingShapeDefinition, text?: string, nodes?: FabricShapeExtention[]) {
        this.initNodes(definition, text, nodes);
    }

    get name() {
        return ShapeTemplatesConstants.Diamond.name;
    }

    private initNodes(definition: DrawingShapeDefinition, text?: string, nodes?: FabricShapeExtention[]) {
        this.nodes = [];
        if (nodes) {
            let rectNode = nodes.find(n => n.shapeNodeType == FabricShapeNodeTypes.rect);
            let textNode = nodes.find(n => n.shapeNodeType == FabricShapeNodeTypes.text);
            if (rectNode)
                this.nodes.push(new FabricRectShape(definition, rectNode.properties));
            if (textNode)
                this.nodes.push(new FabricTextShape(definition, textNode.properties));
        }
        else if (definition) {
            let rectNode = new FabricRectShape(definition);
            let textNode = new FabricTextShape(definition);
            let cleft = definition.width, ctop = 0, tleft = 0, ttop = 0;
            switch (definition.textPosition) {
                case TextPosition.Center:
                    tleft = TextSpacingWithShape;
                    ttop = Math.floor(definition.height / 2 - definition.fontSize / 2);
                    break;
                case TextPosition.Below:
                    ttop = definition.height + TextSpacingWithShape;
                    break;
                default:
                    ctop = definition.fontSize + TextSpacingWithShape;
                    break;
            }
            this.nodes.push(new FabricRectShape(definition, { left: cleft, top: ctop, angle: 45 }));
            this.nodes.push(new FabricTextShape(definition, { left: tleft, top: ttop, text: text || "Sample Text" }));
        }
    }

    getShape(): IShape {
        return {
            name: this.name,
            nodes: this.nodes ? this.nodes.map(n => n.getShapeNode()) : []
        }
    }
}
