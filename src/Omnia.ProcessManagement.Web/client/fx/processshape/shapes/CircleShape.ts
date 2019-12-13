import { fabric } from 'fabric';
import { Shape } from './Shape';
import { FabricShapeTypes, FabricShape, FabricCircleShape, IFabricShape } from '../fabricshape';
import { FabricEllipseShape } from '../fabricshape/FabricEllipseShape';
import { FabricTextShape } from '../fabricshape/FabricTextShape';
import { ShapeExtension } from './ShapeExtension';
import { MultilingualString } from '@omnia/fx-models';
import { DrawingShapeDefinition, TextPosition } from '../../models';
import { ShapeTemplatesConstants, TextSpacingWithShape } from '../../constants';

export class CircleShape extends ShapeExtension implements Shape {
    constructor(definition: DrawingShapeDefinition, nodes?: IFabricShape[], isActive?: boolean, title?: MultilingualString, selectable?: boolean,
        left?: number, top?: number) {
        super(definition, nodes, isActive, title, selectable, left, top);
    }

    get name() {
        return ShapeTemplatesConstants.Circle.name;
    }

    protected initNodes(isActive: boolean, title?: MultilingualString, selectable?: boolean, left?: number, top?: number) {
        if (this.nodes) {
            let circleNode = this.nodes.find(n => n.shapeNodeType == FabricShapeTypes.circle);
            let ellipseNode = this.nodes.find(n => n.shapeNodeType == FabricShapeTypes.ellipse);
            let textNode = this.nodes.find(n => n.shapeNodeType == FabricShapeTypes.text);
            if (circleNode) {
                this.fabricShapes.push(new FabricCircleShape(this.definition, isActive, Object.assign({ selectable: selectable }, circleNode.properties || {})));
            }
            if (ellipseNode) {
                this.fabricShapes.push(new FabricEllipseShape(this.definition, isActive, Object.assign({ selectable: selectable }, ellipseNode.properties || {})));
            }
            if (textNode) {
                this.fabricShapes.push(new FabricTextShape(this.definition, isActive, Object.assign({ selectable: false }, textNode.properties || {}), title));
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
            this.fabricShapes.push(new FabricTextShape(this.definition, isActive, { originX: 'center', left: tleft, top: ttop, selectable: false }, title));
        }
        this.fabricShapes.forEach(s => this.fabricObjects.push(s.fabricObject));
        this.nodes = this.fabricShapes.map(n => n.getShapeNodeJson());
    }
}
