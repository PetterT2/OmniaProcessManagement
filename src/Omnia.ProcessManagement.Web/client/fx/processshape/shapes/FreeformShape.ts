import { fabric } from 'fabric';
import { Shape } from './Shape';
import { FabricTextShape, FabricShapeData, FabricShapeDataTypes, FabricPathShape } from '../fabricshape';
import { DrawingShapeDefinition, ShapeTemplateType } from '../../models';
import { ShapeExtension } from './ShapeExtension';
import { MultilingualString } from '@omnia/fx-models';
import { ShapeTemplatesConstants } from '../../constants';
import { ShapeObject } from '.';

export class FreeformShape extends ShapeExtension implements Shape {
    constructor(definition: DrawingShapeDefinition, nodes?: FabricShapeData[], title?: MultilingualString | string, selectable?: boolean,
        left?: number, top?: number, darkHightlight?: boolean) {
        super(definition, nodes, title, selectable, left, top, darkHightlight);
    }

    get shapeTemplateTypeName() {
        return ShapeTemplateType[ShapeTemplatesConstants.Freeform.settings.type];
    }

    getShapeJson(): ShapeObject {
        let basicShapeJSON = super.getShapeJson();

        if (basicShapeJSON.nodes) {
            basicShapeJSON.nodes.forEach((nodeItem) => {
                if (nodeItem.fabricShapeDataType != FabricShapeDataTypes.text && nodeItem.properties.path) {
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
        let position = this.correctPosition(left, top);
        let highlightProperties = this.getHighlightProperties();

        if (this.nodes) {
            
            let pathNode = this.nodes.find(n => n.fabricShapeDataType == FabricShapeDataTypes.path);
            if (pathNode) {

                this.fabricShapes.push(new FabricPathShape(this.definition, Object.assign({}, pathNode.properties, { left: position.left, top: position.top, selectable: selectable }, highlightProperties), false));

                let textPosition = ShapeExtension.getTextPosition(this.definition, this.fabricShapes[0].fabricObject.getCenterPoint());

                this.fabricShapes.push(new FabricTextShape(this.definition, {originX: this.definition.textAlignment, selectable: selectable, left: textPosition.left, top: textPosition.top }, title));
            }
        }
        this.nodes = this.fabricShapes.map(n => n.getShapeNodeJson());
    }

    protected getShapes(): FabricShapeData[] {
        if (this.fabricShapes && this.fabricShapes.length > 0) {
            this.left = this.fabricShapes[0].fabricObject.left;
            this.top = this.fabricShapes[0].fabricObject.top;
        }
        return this.fabricShapes ? this.fabricShapes.filter(s => s.fabricShapeDataType != FabricShapeDataTypes.line).map(n => n.getShapeNodeJson()) : [];
    }

}
