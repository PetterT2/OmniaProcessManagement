import fabric from 'fabric/fabric-impl';
import { IShapeNode, FabricShapeNodeTypes, FabricShapeExtention } from '../../fabricshape';
import { IShape } from './IShape';
import { Shape } from './Shape';
import { ShapeTemplatesConstants } from '../..';
import FabricCircleShape from '../../fabricshape/FabricCircleShape';
import FabricTextShape from '../../fabricshape/FabricTextShape';
import { TextPosition } from '../../Enums';
import { DrawingShapeDefination } from '../../data';

export class CircleShape implements Shape {
    defination: DrawingShapeDefination;
    nodes: IShapeNode[];

    constructor(settings: DrawingShapeDefination) {
        this.defination = settings;
        this.initNodes();
    }

    get name() {
        return ShapeTemplatesConstants.Circle.name;
    }

    get schema() {
        let schemas = [];
        this.nodes.forEach(n => schemas.push((n as FabricShapeExtention).schema));
        return schemas;
    }

    private initNodes() {
        this.nodes = [];
        let circleNode = new FabricCircleShape(this.defination);
        let textNode = new FabricTextShape(this.defination);
        let cleft = 0, ctop = 0, tleft = 0, ttop = 0;
        switch (this.defination.textPosition) {
            case TextPosition.Above:
                ctop = this.defination.fontSize + 10;
                break;
            case TextPosition.Center:
                tleft = 10;
                ttop = Math.floor(this.defination.height / 2 - this.defination.fontSize / 2);
                break;
            case TextPosition.Below:
                ttop = this.defination.height + 10;
                break;
        }
        circleNode.setProperties({ left: cleft, top: ctop });
        textNode.setProperties({ left: tleft, top: ttop }, "Sample Text")
        this.nodes.push(circleNode);
        this.nodes.push(textNode);
    }
}
