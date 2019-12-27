import { fabric } from 'fabric';
import { Shape } from './Shape';
import { FabricShapeTypes, FabricTextShape, IFabricShape, FabricPolygonShape, FabricPolylineShape } from '../fabricshape';
import { DrawingShapeDefinition, TextPosition } from '../../models';
import { ShapeExtension } from './ShapeExtension';
import { MultilingualString } from '@omnia/fx-models';
import { ShapeTemplatesConstants, TextSpacingWithShape } from '../../constants';
import { IShape } from '.';

export class DiamondShape extends ShapeExtension implements Shape {
    constructor(definition: DrawingShapeDefinition, nodes?: IFabricShape[], isActive?: boolean, title?: MultilingualString, selectable?: boolean,
        left?: number, top?: number) {
        super(definition, nodes, isActive, title, selectable, left, top);
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

    protected initNodes(isActive: boolean, title?: MultilingualString, selectable?: boolean, left?: number, top?: number) {
        if (this.nodes) {
            let polygontNode = this.nodes.find(n => n.shapeNodeType == FabricShapeTypes.polygon);
            let textNode = this.nodes.find(n => n.shapeNodeType == FabricShapeTypes.text);
            if (polygontNode)
                this.fabricShapes.push(new FabricPolygonShape(this.definition, isActive, Object.assign({ selectable: selectable }, polygontNode.properties || {})));
            if (textNode)
                this.fabricShapes.push(new FabricTextShape(this.definition, isActive, Object.assign({ originX: 'center', selectable: false }, textNode.properties) || {}, title));
        }
        else if (this.definition) {
            let points = this.calculatePoints();
            let polygonPosition = this.getObjectPosition(false, left, top, this.definition.width, this.definition.height);
            let textPosition = this.getObjectPosition(true, left, top, this.definition.width, this.definition.height, true);
            this.fabricShapes.push(new FabricPolygonShape(this.definition, isActive, { points: points, left: polygonPosition.left, top: polygonPosition.top, selectable: selectable }));
            this.fabricShapes.push(new FabricTextShape(this.definition, isActive, { originX: 'center', left: textPosition.left, top: textPosition.top, selectable: false }, title));
        }
        this.fabricShapes.forEach(s => this.fabricObjects.push(s.fabricObject));
        this.nodes = this.fabricShapes.map(n => n.getShapeNodeJson());
    }

    private calculatePoints() {
        let points: Array<{ x: number; y: number }> = [
            { x: this.definition.width / 2, y: 0 },
            { x: this.definition.width, y: this.definition.width / 2 },
            { x: this.definition.width / 2, y: this.definition.width },
            { x: 0, y: this.definition.width / 2 }];
        return points;
    }
}
