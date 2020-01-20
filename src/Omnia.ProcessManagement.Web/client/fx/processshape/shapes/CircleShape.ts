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
    constructor(definition: DrawingShapeDefinition, nodes?: IFabricShape[], title?: MultilingualString | string, selectable?: boolean,
        left?: number, top?: number) {
        super(definition, nodes, title, selectable, left, top);
    }

    get name() {
        return ShapeTemplatesConstants.Circle.name;
    }

    protected initNodes(title?: MultilingualString, selectable?: boolean, left?: number, top?: number) {
        let position = this.correctPosition(left, top);
        let textPosition = this.getTextPosition(position, this.definition.width, this.definition.height, this.definition.textHorizontalAdjustment, this.definition.textVerticalAdjustment);

        if (this.nodes) {
            let circleNode = this.nodes.find(n => n.shapeNodeType == FabricShapeTypes.circle);
            let textNode = this.nodes.find(n => n.shapeNodeType == FabricShapeTypes.text);
            if (circleNode) {
                this.fabricShapes.push(new FabricCircleShape(this.definition, Object.assign({ selectable: selectable }, circleNode.properties || {})));
            }
            if (textNode) {
                this.fabricShapes.push(new FabricTextShape(this.definition, Object.assign({ originX: 'center', left: textPosition.left, top: textPosition.top, selectable: selectable }), title));
            }
        }
        else if (this.definition) {
            this.fabricShapes.push(new FabricCircleShape(this.definition, { left: position.left, top: position.top, selectable: selectable }));
            this.fabricShapes.push(new FabricTextShape(this.definition, { originX: 'center', left: textPosition.left, top: textPosition.top, selectable: selectable }, title));
        }
        this.nodes = this.fabricShapes.map(n => n.getShapeNodeJson());
    }
}
