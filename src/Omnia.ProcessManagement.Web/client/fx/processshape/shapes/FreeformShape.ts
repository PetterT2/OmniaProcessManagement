import { fabric } from 'fabric';
import { Shape } from './Shape';
import { FabricTextShape, IFabricShape, FabricShapeTypes, FabricPathShape } from '../fabricshape';
import { DrawingShapeDefinition, TextPosition } from '../../models';
import { ShapeExtension } from './ShapeExtension';
import { MultilingualString } from '@omnia/fx-models';
import { ShapeTemplatesConstants, TextSpacingWithShape } from '../../constants';
import { IShape } from '.';

export class FreeformShape extends ShapeExtension implements Shape {
    constructor(definition: DrawingShapeDefinition, nodes?: IFabricShape[], title?: MultilingualString | string, selectable?: boolean,
        left?: number, top?: number, darkHightlight?: boolean) {
        super(definition, nodes, title, selectable, left, top, darkHightlight);
    }

    get name() {
        return ShapeTemplatesConstants.Freeform.name;
    }

    getShapeJson(): IShape {
        let basicShapeJSON = super.getShapeJson();

        if (basicShapeJSON.nodes) {
            basicShapeJSON.nodes.forEach((nodeItem) => {
                if (nodeItem.shapeNodeType != FabricShapeTypes.text && nodeItem.properties.path) {
                    nodeItem.properties['path'] = this.shapeObject[0]['path'];
                    nodeItem.properties['scaleY'] = this.shapeObject[0]['scaleY'];
                    nodeItem.properties['scaleX'] = this.shapeObject[0]['scaleX'];
                }
            });
        }
        return basicShapeJSON;
    }

    protected initNodes(title?: MultilingualString, selectable?: boolean, left?: number, top?: number) {
        this.fabricShapes = [];
        let strokeProperties = this.getStrokeProperties();

        if (this.nodes) {
            let hasPosition = left != null && top != null;
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

                let position = this.correctPosition(left, top);
                this.fabricShapes.push(new FabricPathShape(this.definition, Object.assign({}, pathNode.properties, { left: position.left, top: position.top, selectable: selectable }, strokeProperties), false));

                
                let textPosition = this.getTextPosition(position, this.definition.width, this.definition.height, this.definition.textHorizontalAdjustment, this.definition.textVerticalAdjustment);
                
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
