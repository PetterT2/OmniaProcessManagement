import { fabric } from 'fabric';
import { Shape } from './Shape';
import { FabricShapeTypes, FabricTextShape, IFabricShape, FabricPolygonShape, FabricPolylineShape } from '../fabricshape';
import { DrawingShapeDefinition, TextPosition } from '../../models';
import { ShapeExtension } from './ShapeExtension';
import { MultilingualString } from '@omnia/fx-models';
import { ShapeTemplatesConstants, TextSpacingWithShape } from '../../constants';

export class DiamondShape extends ShapeExtension implements Shape {
    constructor(definition: DrawingShapeDefinition, nodes?: IFabricShape[], isActive?: boolean, title?: MultilingualString, selectable?: boolean,
        left?: number, top?: number) {
        super(definition, nodes, isActive, title, selectable, left, top);
    }

    get name() {
        return ShapeTemplatesConstants.Diamond.name;
    }

    protected initNodes(isActive: boolean, title?: MultilingualString, selectable?: boolean, left?: number, top?: number) {
        if (this.nodes) {
            let polygontNode = this.nodes.find(n => n.shapeNodeType == FabricShapeTypes.polygon);
            let textNode = this.nodes.find(n => n.shapeNodeType == FabricShapeTypes.text);
            if (polygontNode)
                this.fabricShapes.push(new FabricPolygonShape(this.definition, isActive, Object.assign({ selectable: selectable }, polygontNode.properties || {})));
            if (textNode)
                this.fabricShapes.push(new FabricTextShape(this.definition, isActive, Object.assign({ selectable: false }, textNode.properties) || {}, title));
        }
        else if (this.definition) {
            left = left || 0; top = top || 0;
            left = parseFloat(left.toString());
            top = parseFloat(top.toString());
            let polygonleft = left, polygontop = top, tleft = left + Math.floor(this.definition.width / 2), ttop = top;
            switch (this.definition.textPosition) {
                case TextPosition.Center:
                    ttop += Math.floor(this.definition.width / 2 - this.definition.fontSize / 2 - 2);
                    break;
                case TextPosition.Bottom:
                    ttop += this.definition.width + TextSpacingWithShape;
                    break;
                default:
                    polygontop += this.definition.fontSize + TextSpacingWithShape;
                    break;
            }
            let points: Array<{ x: number; y: number }> = [
                { x: this.definition.width / 2, y: 0 },
                { x: this.definition.width, y: this.definition.width / 2 },
                { x: this.definition.width / 2, y: this.definition.width },
                { x: 0, y: this.definition.width / 2 }];
            this.fabricShapes.push(new FabricPolygonShape(this.definition, isActive, { points: points, left: polygonleft, top: polygontop, selectable: selectable }));
            this.fabricShapes.push(new FabricTextShape(this.definition, isActive, { originX: 'center', left: tleft, top: ttop, selectable: false }, title));
        }
        this.fabricShapes.forEach(s => this.fabricObjects.push(s.fabricObject));
        this.nodes = this.fabricShapes.map(n => n.getShapeNodeJson());
    }
}
