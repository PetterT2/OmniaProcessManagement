import { fabric } from 'fabric';
import { Shape } from './Shape';
import { FabricShape, FabricShapeTypes, FabricTextShape, IFabricShape, FabricPolygonShape } from '../fabricshape';
import { DrawingShapeDefinition, TextPosition } from '../../models';
import { IShape } from './IShape';
import { ShapeExtension } from './ShapeExtension';
import { MultilingualString } from '@omnia/fx-models';
import { ShapeTemplatesConstants, TextSpacingWithShape } from '../../constants';
import { Point } from 'fabric/fabric-impl';

export class PentagonShape extends ShapeExtension implements Shape {
    constructor(definition: DrawingShapeDefinition, nodes?: IFabricShape[], title?: MultilingualString, selectable?: boolean,
        left?: number, top?: number, darkHighlight?: boolean) {
        super(definition, nodes, title, selectable, left, top, darkHighlight);
    }

    get name() {
        return ShapeTemplatesConstants.Pentagon.name;
    }

    ready(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            resolve(true);
        })
    }

    getShapeJson(): IShape {
        let basicShapeJSON = super.getShapeJson();

        if (basicShapeJSON.nodes) {
            basicShapeJSON.nodes.forEach((nodeItem) => {
                if (nodeItem.shapeNodeType != FabricShapeTypes.text && nodeItem.properties.points) {
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
        let textPosition = this.getTextPosition(position, this.definition.width, this.definition.height, this.definition.textHorizontalAdjustment, this.definition.textVerticalAdjustment);
        let strokeProperties = this.getStrokeProperties();
        if (this.nodes) {
            let polygonNode = this.nodes.find(n => n.shapeNodeType == FabricShapeTypes.polygon);
            let textNode = this.nodes.find(n => n.shapeNodeType == FabricShapeTypes.text);
            if (polygonNode) {
                let rectShape = new FabricPolygonShape(this.definition, Object.assign({}, polygonNode.properties, { left: position.left, top: position.top, selectable: selectable }, strokeProperties));
                this.fabricShapes.push(rectShape);
            }
            if (textNode) {
                let textShape = new FabricTextShape(this.definition, Object.assign({ originX: 'center', left: textPosition.left, top: textPosition.top, selectable: selectable }), title);
                this.fabricShapes.push(textShape);
            }

        }
        else if (this.definition) {
            let points = this.getDefaultPoints();
            this.fabricShapes.push(new FabricPolygonShape(this.definition, Object.assign({ points: points, left: position.left, top: position.top, selectable: selectable }, strokeProperties)));
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
