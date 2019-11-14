import { Shape } from './Shape';
import { FabricShapeExtention, ShapeSettings } from '..';
import { ShapeTemplatesConstants, TextSpacingWithShape, Enums } from '../../../../core';
import FabricCircleShape from '../fabricshape/FabricCircleShape';
import FabricTextShape from '../fabricshape/FabricTextShape';
import { ShapeNodeType, FabricShapeNodeTypes } from '../fabricshape';
import FabricEllipseShape from '../fabricshape/FabricEllipseShape';

export class CircleShape implements Shape {
    nodes: FabricShapeExtention[];

    constructor(settings: ShapeSettings, nodes?: FabricShapeExtention[]) {
        this.initNodes(settings, nodes);
    }

    get name() {
        return ShapeTemplatesConstants.Circle.name;
    }

    get schema() {
        let schemas = [];
        this.nodes.forEach(n => schemas.push(n.schema));
        return schemas;
    }

    get toJson() {
        return "";
    }

    private initNodes(settings: ShapeSettings, nodes: FabricShapeExtention[]) {
        this.nodes = [];
        if (nodes) {
            let circleNode = nodes.find(n => n.shapeNodeType == FabricShapeNodeTypes.circle);
            let ellipseNode = nodes.find(n => n.shapeNodeType == FabricShapeNodeTypes.ellipse);
            let textNode = nodes.find(n => n.shapeNodeType == FabricShapeNodeTypes.text);
            if (circleNode)
                this.nodes.push(new FabricCircleShape(settings, circleNode.properties));
            if (ellipseNode)
                this.nodes.push(new FabricEllipseShape(settings, ellipseNode.properties));
            if (textNode)
                this.nodes.push(new FabricTextShape(settings, textNode.properties));
        }
        else if (settings) {
            let circleNode = new FabricCircleShape(settings);
            let textNode = new FabricTextShape(settings);
            let cleft = 0, ctop = 0, tleft = 0, ttop = 0;
            switch (settings.textPosition) {
                case Enums.TextPosition.Center:
                    tleft = TextSpacingWithShape;
                    ttop = Math.floor(settings.height / 2 - settings.fontSize / 2);
                    break;
                case Enums.TextPosition.Below:
                    ttop = settings.height + TextSpacingWithShape;
                    break;
                default:
                    ctop = settings.fontSize + TextSpacingWithShape;
                    break;
            }
            circleNode.setProperties({ left: cleft, top: ctop });
            textNode.setProperties({ left: tleft, top: ttop }, "Sample Text");
            this.nodes.push(circleNode);
            this.nodes.push(textNode);
        }
    }
}
