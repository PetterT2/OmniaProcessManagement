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
                    nodeItem.properties.points = this.calculatePoints();
                }
            });
        }
        return basicShapeJSON;
    }

    //protected onScaling(object: fabric.Object) {
    //    let position = this.correctPosition(object.left, object.top);
    //    let textPosition = this.getTextPosition(position, Math.floor(object.width * object.scaleX), Math.floor(object.height * object.scaleY), this.definition.textHorizontalAdjustment, this.definition.textVerticalAdjustment);
    //    this.fabricShapes[1].fabricObject.set({
    //        left: textPosition.left,
    //        top: textPosition.top
    //    });
    //    this.updatePoints(this.shapeObject[0]);
    //}

    protected initNodes(title?: MultilingualString, selectable?: boolean, left?: number, top?: number) {
        let position = this.correctPosition(left, top);
        let textPosition = this.getTextPosition(position, this.definition.width, this.definition.height, this.definition.textHorizontalAdjustment, this.definition.textVerticalAdjustment);
        let strokeProperties = this.getStrokeProperties();
        if (this.nodes) {
            var fabricGroupObjects: fabric.Object[] = [];
            let polygonNode = this.nodes.find(n => n.shapeNodeType == FabricShapeTypes.polygon);
            let textNode = this.nodes.find(n => n.shapeNodeType == FabricShapeTypes.text);
            if (polygonNode) {
                let rectShape = new FabricPolygonShape(this.definition, Object.assign({ selectable: selectable }, polygonNode.properties || {}, strokeProperties));
                this.fabricShapes.push(rectShape);
                fabricGroupObjects.push(rectShape.fabricObject);
            }
            if (textNode) {
                let textShape = new FabricTextShape(this.definition, Object.assign({ originX: 'center', left: textPosition.left, top: textPosition.top, selectable: selectable }), title);
                this.fabricShapes.push(textShape);
            }

        }
        else if (this.definition) {
            let points = this.calculatePoints();
            this.fabricShapes.push(new FabricPolygonShape(this.definition, Object.assign({ points: points, left: position.left, top: position.top, selectable: selectable }, strokeProperties)));
            this.fabricShapes.push(new FabricTextShape(this.definition, { originX: 'center', left: textPosition.left, top: textPosition.top, selectable: selectable }, title));
        }
        this.nodes = this.fabricShapes.map(n => n.getShapeNodeJson());
    }

    private calculatePoints(): Array<{ x: number; y: number }> {
        let triangleWidth = Math.floor(this.definition.height / 2);
        let points: Array<{ x: number; y: number }> = [
            { x: 0, y: 0 },
            { x: this.definition.width - triangleWidth, y: 0 },
            { x: this.definition.width, y: this.definition.height / 2 },
            { x: this.definition.width - triangleWidth, y: this.definition.height },
            { x: 0, y: this.definition.height }];
        return points;
    }

    private updatePoints(object: fabric.Object) {
        let scaleWidth = Math.floor(object.width * object.scaleX);
        let points = object.toJSON()['points'];
        let triangleWidth = Math.floor(this.definition.height / 2);
        points[1].x = (scaleWidth - triangleWidth) / object.scaleX;
        points[3].x = points[1].x;
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
