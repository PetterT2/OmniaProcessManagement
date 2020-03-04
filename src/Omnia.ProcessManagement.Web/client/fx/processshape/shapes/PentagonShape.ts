import { fabric } from 'fabric';
import { Shape } from './Shape';
import { FabricShapeDataTypes, FabricTextShape, FabricShapeData, FabricPolygonShape } from '../fabricshape';
import { DrawingShapeDefinition, ShapeTemplateType, DrawingPentagonShapeDefinition } from '../../models';
import { ShapeObject } from './ShapeObject';
import { ShapeExtension } from './ShapeExtension';
import { MultilingualString } from '@omnia/fx-models';
import { ShapeTemplatesConstants, } from '../../constants';
import { Point } from 'fabric/fabric-impl';

export class PentagonShape extends ShapeExtension implements Shape {
    definition: DrawingPentagonShapeDefinition;
    constructor(definition: DrawingPentagonShapeDefinition, nodes?: FabricShapeData[], title?: MultilingualString, selectable?: boolean,
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
        if (this.definition.arrowWidthPercent == undefined)
            this.definition.arrowWidthPercent = 0.5;
        if (this.definition.arrowHeightPercent == undefined)
            this.definition.arrowHeightPercent = 0;
        if (this.definition.isLine)
            this.definition.height = 1;
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
        let triangleWidth = Math.floor(this.definition.height * this.definition.arrowWidthPercent);
        let triangleHeight = Math.floor(this.definition.height * this.definition.arrowHeightPercent / 2);
        let lineExtend = 0;
        if (this.definition.arrowHeightPercent && this.definition.arrowHeightPercent > 0 && triangleHeight == 0) {
            lineExtend = 4;
        }
        let points: Array<{ x: number; y: number }> = [
            { x: 0, y: triangleHeight },
            { x: this.definition.width - triangleWidth - lineExtend, y: triangleHeight },
            { x: this.definition.width, y: this.definition.height / 2 },
            { x: this.definition.width - triangleWidth - lineExtend, y: this.definition.height + lineExtend },
            { x: 0, y: this.definition.height - triangleHeight }];

        if (this.definition.arrowHeightPercent && this.definition.arrowHeightPercent > 0) {
            points.splice(2, 0, { x: this.definition.width - triangleWidth - lineExtend, y: 0 - lineExtend });
            points.splice(5, 0, { x: this.definition.width - triangleWidth - lineExtend, y: this.definition.height - triangleHeight });
        }
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

    protected onScaling(object: fabric.Object, enableGrid: boolean) {
        super.onScaling(object, enableGrid);
        this.updatePoints(this.shapeObject[0]);
    }

    private updatePoints(object: fabric.Object) {
        let triangleWidth = Math.floor(object.height * object.scaleY * this.definition.arrowWidthPercent);
        let triangleHeight = Math.floor(object.height * object.scaleY * this.definition.arrowHeightPercent / 2);
        let lineExtend = 0;
        if (this.definition.arrowHeightPercent && this.definition.arrowHeightPercent > 0 && triangleHeight == 0) {
            lineExtend = 4;
        }
        let scaleWidth = Math.floor(object.width * object.scaleX);
        let points = object.toJSON()['points'];
        if (points.length > 5) {
            points[1].x = (scaleWidth - triangleWidth - lineExtend) / object.scaleX;
            points[2].x = points[1].x;

            points[4].x = points[1].x;
            points[5].x = points[1].x;
        } else {
            points[1].x = (scaleWidth - triangleWidth) / object.scaleX;
            points[3].x = points[1].x;           
        }
        (object as any).points = points;
        object.dirty = true;
    }

    addEventListener(canvas: fabric.Canvas, gridX?: number, gridY?: number) {
        super.addEventListener(canvas, gridX, gridY);
        this.shapeObject[0].on({
            "scaled": (e) => {
                this.updatePoints(e.target);
            }
        })
    }
}
