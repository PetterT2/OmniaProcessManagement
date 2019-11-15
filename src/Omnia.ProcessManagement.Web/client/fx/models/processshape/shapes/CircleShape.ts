import { Shape } from './Shape';
import { FabricShapeNodeTypes, FabricShapeExtention, FabricCircleShape } from '../fabricshape';
import { DrawingShapeDefinition, TextPosition } from '../../data';
import { IShape } from './IShape';
import { FabricEllipseShape } from '../fabricshape/FabricEllipseShape';
import { FabricTextShape } from '../fabricshape/FabricTextShape';
import { TextSpacingWithShape, ShapeTemplatesConstants } from '../../../constants';

export class CircleShape implements Shape {
    nodes: FabricShapeExtention[];

    constructor(definition: DrawingShapeDefinition, text?: string, nodes?: FabricShapeExtention[]) {
        this.initNodes(definition, text, nodes);
    }

    get name() {
        return ShapeTemplatesConstants.Circle.name;
    }

    private initNodes(definition: DrawingShapeDefinition, text?: string, nodes?: FabricShapeExtention[]) {
        this.nodes = [];
        if (nodes) {
            let circleNode = nodes.find(n => n.shapeNodeType == FabricShapeNodeTypes.circle);
            let ellipseNode = nodes.find(n => n.shapeNodeType == FabricShapeNodeTypes.ellipse);
            let textNode = nodes.find(n => n.shapeNodeType == FabricShapeNodeTypes.text);
            if (circleNode)
                this.nodes.push(new FabricCircleShape(definition, circleNode.properties));
            if (ellipseNode)
                this.nodes.push(new FabricEllipseShape(definition, ellipseNode.properties));
            if (textNode)
                this.nodes.push(new FabricTextShape(definition, textNode.properties));
        }
        else if (definition) {
            let cleft = 0, ctop = 0, tleft = 0, ttop = 0;
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
            this.nodes.push(new FabricCircleShape(definition, { left: cleft, top: ctop }));
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
