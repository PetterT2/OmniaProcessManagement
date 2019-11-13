import fabric from 'fabric/fabric-impl';
import { IShapeNode, FabricShapeNodeTypes, FabricShapeExtention } from '../../fabricshape';
import { IShape } from './IShape';
import { Shape } from './Shape';
import { ShapeSettings } from '..';
import { ShapeTemplatesConstants } from '../..';
import FabricCircleShape from '../../fabricshape/FabricCircleShape';
import FabricTextShape from '../../fabricshape/FabricTextShape';
import { TextPosition } from '../../Enums';

export class CircleShape implements Shape {
    settings: ShapeSettings;
    nodes: IShapeNode[];

    constructor(settings: ShapeSettings) {
        this.settings = settings;
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
        let circleNode = new FabricCircleShape(this.settings);
        let textNode = new FabricTextShape(this.settings);
        let cleft = 0, ctop = 0, tleft = 0, ttop = 0;
        switch (this.settings.textPosition) {
            case TextPosition.Above:
                ctop = this.settings.fontSize + 10;
                break;
            case TextPosition.Center:
                tleft = 10;
                ttop = Math.floor(this.settings.height / 2 - this.settings.fontSize / 2);
                break;
            case TextPosition.Below:
                ttop = this.settings.height + 10;
                break;
        }
        circleNode.setProperties({ left: cleft, top: ctop });
        textNode.setProperties({ left: tleft, top: ttop }, "Sample Text")
        this.nodes.push(circleNode);
        this.nodes.push(textNode);
    }
}
