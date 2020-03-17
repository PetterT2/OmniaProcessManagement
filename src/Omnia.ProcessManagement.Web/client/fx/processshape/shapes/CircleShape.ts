import { fabric } from 'fabric';
import { Shape } from './Shape';
import { FabricShapeDataTypes, FabricCircleShape, FabricShapeData } from '../fabricshape';
import { FabricTextShape } from '../fabricshape/FabricTextShape';
import { ShapeExtension } from './ShapeExtension';
import { MultilingualString } from '@omnia/fx-models';
import { DrawingShapeDefinition, ShapeTemplateType } from '../../models';
import { ShapeTemplatesConstants } from '../../constants';
import { ShapeObject } from '.';

export class CircleShape extends ShapeExtension implements Shape {
    constructor(definition: DrawingShapeDefinition, nodes?: FabricShapeData[], title?: MultilingualString | string, selectable?: boolean,
        left?: number, top?: number, darkHighlight?: boolean) {
        super(definition, nodes, title, selectable, left, top, darkHighlight);
    }

    getShapeJson(): ShapeObject {
        let basicShapeJSON = super.getShapeJson();

        if (basicShapeJSON.nodes) {
            basicShapeJSON.nodes.forEach((nodeItem) => {
                if (nodeItem.fabricShapeDataType != FabricShapeDataTypes.text) {
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

    get shapeTemplateTypeName() {
        return ShapeTemplateType[ShapeTemplatesConstants.Circle.settings.type];
    }

    protected initNodes(title?: MultilingualString, selectable?: boolean, left?: number, top?: number) {
        let highlightProperties = this.getHighlightProperties();
        let position = this.correctPosition(left, top);
        let textPosition = ShapeExtension.getTextPosition(this.definition, null, left, top);
        if (this.nodes) {
            let circleNode = this.nodes.find(n => n.fabricShapeDataType == FabricShapeDataTypes.circle);
            let textNode = this.nodes.find(n => n.fabricShapeDataType == FabricShapeDataTypes.text);
            if (circleNode) {
                this.fabricShapes.push(new FabricCircleShape(this.definition, Object.assign({}, circleNode.properties, { left: position.left, top: position.top, selectable: selectable }, highlightProperties)));
                textPosition = ShapeExtension.getTextPosition(this.definition, this.fabricShapes[0].fabricObject.getCenterPoint());
            }
            if (textNode) {
                this.fabricShapes.push(new FabricTextShape(this.definition, Object.assign({ originX: this.definition.textAlignment, left: textPosition.left, top: textPosition.top, selectable: selectable }), title));
            }
        }
        else if (this.definition) {
            let scaleY = this.definition.width != this.definition.height ? this.definition.height / this.definition.width : 1;

            this.fabricShapes.push(new FabricCircleShape(this.definition, Object.assign({ left: position.left, top: position.top, selectable: selectable, scaleY: scaleY }, highlightProperties)));
            this.fabricShapes.push(new FabricTextShape(this.definition, { originX: this.definition.textAlignment, left: textPosition.left, top: textPosition.top, selectable: selectable }, title));
        }
        this.nodes = this.fabricShapes.map(n => n.getShapeNodeJson());
    }
}
