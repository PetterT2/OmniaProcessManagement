import { Shape } from './Shape';
import { ShapeTemplatesConstants } from '../../../constants';
import { FabricShapeExtention, FabricShapeNodeTypes, FabricRectShape, FabricTextShape, FabricTriangleShape } from '../fabricshape';
import { DrawingShapeDefinition, TextPosition } from '../../data';
import { IShape } from './IShape';
//import { Utils } from '@omnia/fx';

export class PentagonShape implements Shape {
    nodes: FabricShapeExtention[];
    private triangleWidth: number = 20;

    constructor(definition: DrawingShapeDefinition, text?: string, nodes?: FabricShapeExtention[]) {
        this.initNodes(definition, text, nodes);
    }

    get name() {
        return ShapeTemplatesConstants.Pentagon.name;
    }

    private initNodes(definition: DrawingShapeDefinition, text?: string, nodes?: FabricShapeExtention[]) {
        this.nodes = [];
        if (nodes) {
            let rectNode = nodes.find(n => n.shapeNodeType == FabricShapeNodeTypes.rect);
            let triangleNode = nodes.find(n => n.shapeNodeType == FabricShapeNodeTypes.triangle);
            let textNode = nodes.find(n => n.shapeNodeType == FabricShapeNodeTypes.text);
            if (rectNode)
                this.nodes.push(new FabricRectShape(definition, rectNode.properties));
            if (triangleNode)
                this.nodes.push(new FabricTriangleShape(definition, triangleNode.properties));
            if (textNode)
                this.nodes.push(new FabricTextShape(definition, textNode.properties));
        }
        else if (definition) {
            //let cleft = 0, ctop = 0, tleft = 0, ttop = 0, trleft = definition.width - this.triangleWidth, trtop = 0;
            //let triangleDefinition: DrawingShapeDefinition = Utils.clone(definition);
            //triangleDefinition.width = definition.height;
            //triangleDefinition.height = this.triangleWidth;
            //let recDefinition: DrawingShapeDefinition = Utils.clone(definition);
            //recDefinition.width = definition.width - this.triangleWidth;

            //switch (definition.textPosition) {
            //    case TextPosition.Center:
            //        tleft = TextSpacingWithShape;
            //        ttop = Math.floor(definition.height / 2 - definition.fontSize / 2);
            //        break;
            //    case TextPosition.Below:
            //        ttop = definition.height + TextSpacingWithShape;
            //        break;
            //    default:
            //        ctop = definition.fontSize + TextSpacingWithShape;
            //        break;
            //}

            //this.nodes.push(new FabricRectShape(recDefinition, { left: cleft, top: ctop }));
            //this.nodes.push(new FabricTriangleShape(triangleDefinition, { left: trleft, top: trtop, angle: 90 }));
            //this.nodes.push(new FabricTextShape(definition, { left: tleft, top: ttop, text: text || "Sample Text" }));
        }
    }

    getShape(): IShape {
        return {
            name: this.name,
            nodes: this.nodes ? this.nodes.map(n => n.getShapeNode()) : []
        }
    }
}
