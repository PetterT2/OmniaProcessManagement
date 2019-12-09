import { fabric } from 'fabric';
import { Shape } from './Shape';
import { FabricShapeTypes, FabricRectShape, FabricTextShape, IFabricShape } from '../fabricshape';
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
            let rectNode = this.nodes.find(n => n.shapeNodeType == FabricShapeTypes.rect);
            let textNode = this.nodes.find(n => n.shapeNodeType == FabricShapeTypes.text);
            if (rectNode)
                this.fabricShapes.push(new FabricRectShape(this.definition, isActive, Object.assign({ selectable: selectable }, rectNode.properties || {})));
            if (textNode)
                this.fabricShapes.push(new FabricTextShape(this.definition, isActive, Object.assign({ selectable: selectable }, textNode.properties) || {}, title));
        }
        else if (this.definition) {
            let diamondWidth = Math.floor(Math.sqrt(Math.pow(this.definition.width, 2) / 2));
            left = left || 0; top = top || 0;
            left = parseFloat(left.toString());
            left = left - diamondWidth;
            if (left < 0) left = 0;
            top = parseFloat(top.toString());
            let recleft = this.definition.width + left, rectop = top, tleft = left + diamondWidth + (this.definition.width - diamondWidth), ttop = top;
            switch (this.definition.textPosition) {
                case TextPosition.Center:
                    ttop = top + Math.floor(Math.sqrt(Math.pow(this.definition.width, 2) / 2) - this.definition.fontSize / 2 - 2);
                    break;
                case TextPosition.Bottom:
                    ttop += Math.floor(Math.sqrt(Math.pow(this.definition.width, 2) * 2)) + TextSpacingWithShape;
                    break;
                default:
                    rectop += this.definition.fontSize + TextSpacingWithShape;
                    break;
            }
            this.fabricShapes.push(new FabricRectShape(this.definition, isActive, { left: recleft, top: rectop, angle: 45, selectable: selectable }));
            this.fabricShapes.push(new FabricTextShape(this.definition, isActive, { originX: 'center', left: tleft, top: ttop, selectable: selectable }, title));
        }
        this.fabricShapes.forEach(s => this.fabricObjects.push(s.fabricObject));
        this.nodes = this.fabricShapes.map(n => n.getShapeNodeJson());
    }
}
