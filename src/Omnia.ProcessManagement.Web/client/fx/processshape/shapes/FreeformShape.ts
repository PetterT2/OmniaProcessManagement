import { fabric } from 'fabric';
import { Shape } from './Shape';
import { FabricTextShape, IFabricShape, FabricShapeTypes, FabricPathShape } from '../fabricshape';
import { DrawingShapeDefinition, TextPosition } from '../../models';
import { ShapeExtension } from './ShapeExtension';
import { MultilingualString } from '@omnia/fx-models';
import { ShapeTemplatesConstants, TextSpacingWithShape } from '../../constants';

export class FreeformShape extends ShapeExtension implements Shape {
    constructor(definition: DrawingShapeDefinition, nodes?: IFabricShape[], title?: MultilingualString | string, selectable?: boolean,
        left?: number, top?: number, darkHightlight?: boolean) {
        super(definition, nodes, title, selectable, left, top, darkHightlight);
    }

    get name() {
        return ShapeTemplatesConstants.Freeform.name;
    }

    protected initNodes(title?: MultilingualString, selectable?: boolean, left?: number, top?: number) {
        this.fabricShapes = [];
        let strokeProperties = this.getStrokeProperties();

        if (this.nodes) {
            let hasPosition = (left != null && left != undefined) && (top != null && top != undefined);
            if (hasPosition) {
                left = parseFloat(left.toString());
                top = parseFloat(top.toString());
            }
            let pathNode = this.nodes.find(n => n.shapeNodeType == FabricShapeTypes.path);
            if (pathNode) {
                if (hasPosition) {
                    pathNode.properties['left'] = left;
                    pathNode.properties['top'] = top;
                }
                this.fabricShapes.push(new FabricPathShape(this.definition, Object.assign({ selectable: selectable }, pathNode.properties || {}, strokeProperties), true));
                let position = this.correctPosition(this.fabricShapes[0].fabricObject.left, this.fabricShapes[0].fabricObject.top);
                let textPosition = this.getTextPosition(position, this.fabricShapes[0].fabricObject.width, this.fabricShapes[0].fabricObject.height, this.definition.textHorizontalAdjustment, this.definition.textVerticalAdjustment);
                
                this.fabricShapes.push(new FabricTextShape(this.definition, { originX: 'center', selectable: selectable, left: textPosition.left, top: textPosition.top }, title));
            }
        }
        this.nodes = this.fabricShapes.map(n => n.getShapeNodeJson());
    }

    protected getShapes(): IFabricShape[] {
        if (this.fabricShapes && this.fabricShapes.length > 0) {
            this.left = this.fabricShapes[0].fabricObject.left;
            this.top = this.fabricShapes[0].fabricObject.top;
        }
        return this.fabricShapes ? this.fabricShapes.filter(s => s.shapeNodeType != FabricShapeTypes.line).map(n => n.getShapeNodeJson()) : [];
    }

}
