import { fabric } from 'fabric';
import { Shape } from './Shape';
import { FabricShapeDataTypes, FabricTextShape, FabricShapeData, FabricPolygonShape } from '../fabricshape';
import { DrawingShapeDefinition, TextPosition, ShapeTemplateType } from '../../models';
import { ShapeExtension } from './ShapeExtension';
import { MultilingualString } from '@omnia/fx-models';
import { ShapeTemplatesConstants } from '../../constants';
import { ShapeObject } from '.';

export class DiamondShape extends ShapeExtension implements Shape {
    constructor(definition: DrawingShapeDefinition, nodes?: FabricShapeData[], title?: MultilingualString, selectable?: boolean,
        left?: number, top?: number, darkHighlight?: boolean) {
        super(definition, nodes, title, selectable, left, top, darkHighlight);
    }

    get shapeTemplateTypeName() {
        return ShapeTemplateType[ShapeTemplatesConstants.Diamond.settings.type];
    }

    getShapeJson(): ShapeObject {
        let basicShapeJSON = super.getShapeJson();

        if (basicShapeJSON.nodes) {
            basicShapeJSON.nodes.forEach((nodeItem) => {
                if (nodeItem.fabricShapeDataType != FabricShapeDataTypes.text && nodeItem.properties.points) {
                    let points = this.shapeObject[0].get('points' as any);
                    let scaleX = this.shapeObject[0].scaleX;
                    let scaleY = this.shapeObject[0].scaleY;
                    nodeItem.properties.points = this.getCalculatedPoints(points, scaleX, scaleY);
                }
            });
        }
        return basicShapeJSON;
    }       

    protected initNodes(title?: MultilingualString, selectable?: boolean, left?: number, top?: number) {
        let position = this.correctPosition(left, top);
        let textPosition = ShapeExtension.getTextPosition(this.definition);
        let highlightProperties = this.getHighlightProperties();

        if (this.nodes) {
            let polygontNode = this.nodes.find(n => n.fabricShapeDataType == FabricShapeDataTypes.polygon);
            let textNode = this.nodes.find(n => n.fabricShapeDataType == FabricShapeDataTypes.text);
            if (polygontNode) {
                this.fabricShapes.push(new FabricPolygonShape(this.definition, Object.assign({}, polygontNode.properties, { left: position.left, top: position.top, selectable: selectable }, highlightProperties)));
                textPosition = ShapeExtension.getTextPosition(this.definition, this.fabricShapes[0].fabricObject.getCenterPoint());
            }

            if (textNode) {
                this.fabricShapes.push(new FabricTextShape(this.definition, Object.assign({originX: this.definition.textAlignment, left: textPosition.left, top: textPosition.top, selectable: selectable }) || {}, title));
            }
        }
        else if (this.definition) {
            let points = this.getDefaultPoints();
            this.fabricShapes.push(new FabricPolygonShape(this.definition, Object.assign({ points: points, left: position.left, top: position.top, selectable: selectable }, highlightProperties)));
            this.fabricShapes.push(new FabricTextShape(this.definition, {originX: this.definition.textAlignment, left: textPosition.left, top: textPosition.top, selectable: selectable }, title));
        }
        this.nodes = this.fabricShapes.map(n => n.getShapeNodeJson());
    }

    private getDefaultPoints() {
        let points: Array<{ x: number; y: number }> = [
            { x: this.definition.width / 2, y: 0 },
            { x: this.definition.width, y: this.definition.height / 2 },
            { x: this.definition.width / 2, y: this.definition.height },
            { x: 0, y: this.definition.height / 2 }];
        return points;
    }

    private getCalculatedPoints(points: Array<{ x: number; y: number }>, scaleX: number, scaleY: number): Array<{ x: number; y: number }> {
        return points.map(p => {
            return {
                x: p.x * scaleX,
                y: p.y * scaleY
            }
        })
    }
}
