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
    constructor(definition: DrawingShapeDefinition, nodes?: IFabricShape[], isActive?: boolean, title?: MultilingualString, selectable?: boolean,
        left?: number, top?: number) {
        super(definition, nodes, isActive, title, selectable, left, top);
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

    private initExistingNodes(title: MultilingualString, recDefinition: DrawingShapeDefinition,
        isActive: boolean, selectable: boolean) {
        var fabricGroupObjects: fabric.Object[] = [];
        var fabricTextObject: fabric.Object;
        let polygonNode = this.nodes.find(n => n.shapeNodeType == FabricShapeTypes.polygon);
        let textNode = this.nodes.find(n => n.shapeNodeType == FabricShapeTypes.text);
        if (polygonNode) {
            let rectShape = new FabricPolygonShape(recDefinition, isActive, Object.assign({ selectable: selectable }, polygonNode.properties || {}));
            this.fabricShapes.push(rectShape);
            fabricGroupObjects.push(rectShape.fabricObject);
        }
        if (textNode) {
            let textShape = new FabricTextShape(this.definition, isActive, Object.assign({ selectable: false }, textNode.properties || {}), title);
            this.fabricShapes.push(textShape);
            fabricTextObject = textShape.fabricObject;
        }
        this.fabricShapes.forEach(s => this.fabricObjects.push(s.fabricObject));
        this.nodes = this.fabricShapes.map(n => n.getShapeNodeJson());
    }

    protected initNodes(isActive: boolean, title?: MultilingualString, selectable?: boolean, left?: number, top?: number) {
        if (this.nodes) {
            this.initExistingNodes(title, this.definition, isActive, selectable);
        }
        else if (this.definition) {
            left = left || 0; top = top || 0;
            left = parseFloat(left.toString());
            top = parseFloat(top.toString());
            let recleft = left, rectop = top, tleft = recleft + TextSpacingWithShape, ttop = top;

            switch (this.definition.textPosition) {
                case TextPosition.Center:
                    ttop += Math.floor(this.definition.height / 2 - this.definition.fontSize / 2 - 2);
                    break;
                case TextPosition.Bottom:
                    ttop += this.definition.height + TextSpacingWithShape;
                    break;
                default:
                    rectop += this.definition.fontSize + TextSpacingWithShape;
                    break;
            }

            let points = this.calculatePoints();
            this.fabricShapes.push(new FabricPolygonShape(this.definition, isActive, { points: points, left: recleft, top: rectop, selectable: selectable }));
            this.fabricShapes.push(new FabricTextShape(this.definition, isActive, { originX: 'left', left: tleft, top: ttop, selectable: false }, title));

            this.fabricShapes.forEach(s => this.fabricObjects.push(s.fabricObject));
            this.nodes = this.fabricShapes.map(n => n.getShapeNodeJson());
        }
    }

    private calculatePoints() {
        let triangleWidth = Math.floor(this.definition.height / 2);        
        let points: Array<{ x: number; y: number }> = [
            { x: 0, y: 0 },
            { x: this.definition.width - triangleWidth, y: 0 },
            { x: this.definition.width, y: this.definition.height / 2 },
            { x: this.definition.width - triangleWidth, y: this.definition.height },
            { x: 0, y: this.definition.height }];
        return points;
    }
}
