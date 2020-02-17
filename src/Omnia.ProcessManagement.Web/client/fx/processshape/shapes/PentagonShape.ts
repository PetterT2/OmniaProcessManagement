import { fabric } from 'fabric';
import { Shape } from './Shape';
import { FabricShapeDataTypes, FabricTextShape, FabricShapeData, FabricPolygonShape } from '../fabricshape';
import { DrawingShapeDefinition, ShapeTemplateType } from '../../models';
import { ShapeObject } from './ShapeObject';
import { ShapeExtension } from './ShapeExtension';
import { MultilingualString } from '@omnia/fx-models';
import { ShapeTemplatesConstants, } from '../../constants';
import { Point } from 'fabric/fabric-impl';

export class PentagonShape extends ShapeExtension implements Shape {
    constructor(definition: DrawingShapeDefinition, nodes?: FabricShapeData[], title?: MultilingualString, selectable?: boolean,
        left?: number, top?: number, darkHighlight?: boolean) {
        super(definition, nodes, title, selectable, left, top, darkHighlight);
    }

    get shapeTemplateTypeName() {
        return ShapeTemplateType[ShapeTemplatesConstants.Pentagon.settings.type];
    }

    ready(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            resolve(true);
        })
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
        let textPosition = this.getTextPosition(position);
        let highlightProperties = this.getHighlightProperties();
        if (this.nodes) {
            let polygonNode = this.nodes.find(n => n.fabricShapeDataType == FabricShapeDataTypes.polygon);
            let textNode = this.nodes.find(n => n.fabricShapeDataType == FabricShapeDataTypes.text);
            if (polygonNode) {
                let rectShape = new FabricPolygonShape(this.definition, Object.assign({}, polygonNode.properties, { left: position.left, top: position.top, selectable: selectable }, highlightProperties));
                this.fabricShapes.push(rectShape);
            }
            if (textNode) {
                textPosition = this.getTextPositionAfterRotate(textPosition);
                let textShape = new FabricTextShape(this.definition, Object.assign({ originX: 'center', left: textPosition.left, top: textPosition.top, selectable: selectable }), title);
                this.fabricShapes.push(textShape);
            }

        }
        else if (this.definition) {
            let points = this.getDefaultPoints();
            this.fabricShapes.push(new FabricPolygonShape(this.definition, Object.assign({ points: points, left: position.left, top: position.top, selectable: selectable }, highlightProperties)));
            this.fabricShapes.push(new FabricTextShape(this.definition, { originX: 'center', left: textPosition.left, top: textPosition.top, selectable: selectable }, title));
        }
        this.nodes = this.fabricShapes.map(n => n.getShapeNodeJson());
    }

    private getDefaultPoints(): Array<{ x: number; y: number }> {
        let triangleWidth = Math.floor(this.definition.height / 2);
        let points: Array<{ x: number; y: number }> = [
            { x: 0, y: 0 },
            { x: this.definition.width - triangleWidth, y: 0 },
            { x: this.definition.width, y: this.definition.height / 2 },
            { x: this.definition.width - triangleWidth, y: this.definition.height },
            { x: 0, y: this.definition.height }];
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
