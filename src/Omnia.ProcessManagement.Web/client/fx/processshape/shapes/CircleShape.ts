import { fabric } from 'fabric';
import { Shape } from './Shape';
import { FabricShapeTypes, FabricShape, FabricCircleShape, IFabricShape } from '../fabricshape';
import { FabricEllipseShape } from '../fabricshape/FabricEllipseShape';
import { FabricTextShape } from '../fabricshape/FabricTextShape';
import { ShapeExtension } from './ShapeExtension';
import { MultilingualString } from '@omnia/fx-models';
import { DrawingShapeDefinition, TextPosition } from '../../models';
import { ShapeTemplatesConstants, TextSpacingWithShape } from '../../constants';
import { IShape } from '.';

export class CircleShape extends ShapeExtension implements Shape {
    constructor(definition: DrawingShapeDefinition, nodes?: IFabricShape[], title?: MultilingualString | string, selectable?: boolean,
        left?: number, top?: number, darkHighlight?: boolean) {
        super(definition, nodes, title, selectable, left, top, darkHighlight);
    }

    getShapeJson(): IShape {
        let basicShapeJSON = super.getShapeJson();

        if (basicShapeJSON.nodes) {
            basicShapeJSON.nodes.forEach((nodeItem) => {
                if (nodeItem.shapeNodeType != FabricShapeTypes.text) {
                    nodeItem.properties['radius'] = this.shapeObject[0]['radius'];
                    nodeItem.properties['endAngle'] = this.shapeObject[0]['endAngle'];
                    nodeItem.properties['startAngle'] = this.shapeObject[0]['startAngle'];
                    nodeItem.properties['scaleY'] = this.shapeObject[0]['scaleY'];
                    nodeItem.properties['scaleX'] = this.shapeObject[0]['scaleX'];

                    //console.log(JSON.stringify(nodeItem.properties['oCoords']));
                }
            });
        }
        return basicShapeJSON;
    }

    get name() {
        return ShapeTemplatesConstants.Circle.name;
    }

    protected initNodes(title?: MultilingualString, selectable?: boolean, left?: number, top?: number) {
        let highlightProperties = this.getHighlightProperties();
        let position = this.correctPosition(left, top);
        let textPosition = this.getTextPosition(position);

        if (this.nodes) {
            let circleNode = this.nodes.find(n => n.shapeNodeType == FabricShapeTypes.circle);
            let textNode = this.nodes.find(n => n.shapeNodeType == FabricShapeTypes.text);
            if (circleNode) {
                this.fabricShapes.push(new FabricCircleShape(this.definition, Object.assign({}, circleNode.properties, { left: position.left, top: position.top, selectable: selectable }, highlightProperties)));
            }
            if (textNode) {
                textPosition = this.getTextPositionAfterRotate(textPosition);
                this.fabricShapes.push(new FabricTextShape(this.definition, Object.assign({ originX: 'center', left: textPosition.left, top: textPosition.top, selectable: selectable }), title));
            }
        }
        else if (this.definition) {
            this.fabricShapes.push(new FabricCircleShape(this.definition, Object.assign({ left: position.left, top: position.top, selectable: selectable }, highlightProperties)));
            this.fabricShapes.push(new FabricTextShape(this.definition, { originX: 'center', left: textPosition.left, top: textPosition.top, selectable: selectable }, title));
        }
        this.nodes = this.fabricShapes.map(n => n.getShapeNodeJson());
    }
}
