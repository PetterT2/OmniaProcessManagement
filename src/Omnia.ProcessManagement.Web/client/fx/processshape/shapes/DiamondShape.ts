import { fabric } from 'fabric';
import { Shape } from './Shape';
import { FabricShapeTypes, FabricTextShape, IFabricShape, FabricPolygonShape, FabricPolylineShape } from '../fabricshape';
import { DrawingShapeDefinition, TextPosition } from '../../models';
import { ShapeExtension } from './ShapeExtension';
import { MultilingualString } from '@omnia/fx-models';
import { ShapeTemplatesConstants, TextSpacingWithShape } from '../../constants';
import { IShape } from '.';

export class DiamondShape extends ShapeExtension implements Shape {
    constructor(definition: DrawingShapeDefinition, nodes?: IFabricShape[], title?: MultilingualString, selectable?: boolean,
        left?: number, top?: number) {
        super(definition, nodes, title, selectable, left, top);
    }

    get name() {
        return ShapeTemplatesConstants.Diamond.name;
    }

    getShapeJson(): IShape {
        let basicShapeJSON = super.getShapeJson();

        if (basicShapeJSON.nodes) {
            basicShapeJSON.nodes.forEach((nodeItem) => {
                if (nodeItem.shapeNodeType != FabricShapeTypes.text && nodeItem.properties.points) {
                    nodeItem.properties.points = this.calculatePoints();
                }
            });
        }
        return basicShapeJSON;
    }

    protected initNodes(title?: MultilingualString, selectable?: boolean, left?: number, top?: number) {
        let position = this.correctPosition(left, top);
        let textPosition = this.getTextPosition(position, this.definition.width, this.definition.height, this.definition.textHorizontalAdjustment, this.definition.textVerticalAdjustment);
        if (this.nodes) {
            let polygontNode = this.nodes.find(n => n.shapeNodeType == FabricShapeTypes.polygon);
            let textNode = this.nodes.find(n => n.shapeNodeType == FabricShapeTypes.text);
            if (polygontNode) {
                this.fabricShapes.push(new FabricPolygonShape(this.definition, Object.assign({ selectable: selectable }, polygontNode.properties || {})));
            }

            if (textNode) {
                this.fabricShapes.push(new FabricTextShape(this.definition, Object.assign({ originX: 'center', left: textPosition.left, top: textPosition.top, selectable: selectable }) || {}, title));
            }
        }
        else if (this.definition) {
            let points = this.calculatePoints();
            this.fabricShapes.push(new FabricPolygonShape(this.definition, { points: points, left: position.left, top: position.top, selectable: selectable }));
            this.fabricShapes.push(new FabricTextShape(this.definition, { originX: 'center', left: textPosition.left, top: textPosition.top, selectable: selectable }, title));
        }
        this.nodes = this.fabricShapes.map(n => n.getShapeNodeJson());
    }

    private calculatePoints() {
        let points: Array<{ x: number; y: number }> = [
            { x: this.definition.width / 2, y: 0 },
            { x: this.definition.width, y: this.definition.height / 2 },
            { x: this.definition.width / 2, y: this.definition.height },
            { x: 0, y: this.definition.height / 2 }];
        return points;
    }
}
