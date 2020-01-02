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
        left?: number, top?: number) {
        super(definition, nodes, title, selectable, left, top);
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

    private initExistingNodes(title: MultilingualString, recDefinition: DrawingShapeDefinition, selectable: boolean) {
        var fabricGroupObjects: fabric.Object[] = [];
        var fabricTextObject: fabric.Object;
        let polygonNode = this.nodes.find(n => n.shapeNodeType == FabricShapeTypes.polygon);
        let textNode = this.nodes.find(n => n.shapeNodeType == FabricShapeTypes.text);
        if (polygonNode) {
            let rectShape = new FabricPolygonShape(recDefinition, Object.assign({ selectable: selectable }, polygonNode.properties || {}));
            this.fabricShapes.push(rectShape);
            fabricGroupObjects.push(rectShape.fabricObject);
        }
        if (textNode) {
            let textShape = new FabricTextShape(this.definition, Object.assign({ selectable: false }, textNode.properties || {}), title);
            this.fabricShapes.push(textShape);
            fabricTextObject = textShape.fabricObject;
        }
        this.fabricShapes.forEach(s => this.fabricObjects.push(s.fabricObject));
        this.nodes = this.fabricShapes.map(n => n.getShapeNodeJson());
    }

    protected initNodes(title?: MultilingualString, selectable?: boolean, left?: number, top?: number) {
        if (this.nodes) {
            this.initExistingNodes(title, this.definition, selectable);
        }
        else if (this.definition) {
            let pentagonPosition = this.getObjectPosition(false, left, top, this.definition.width, this.definition.height);
            let textPosition = this.getObjectPosition(true, left, top, this.definition.width, this.definition.height, false);

            let points = this.calculatePoints();
            this.fabricShapes.push(new FabricPolygonShape(this.definition, { points: points, left: pentagonPosition.left, top: pentagonPosition.top, selectable: selectable }));
            this.fabricShapes.push(new FabricTextShape(this.definition, { originX: 'left', left: textPosition.left, top: textPosition.top, selectable: false }, title));

            this.fabricShapes.forEach(s => this.fabricObjects.push(s.fabricObject));
            this.nodes = this.fabricShapes.map(n => n.getShapeNodeJson());
        }
    }

    finishScaled(object: fabric.Object) {
        let textPosition = this.getObjectPosition(true, object.left, object.top, object.width * object.scaleX, object.height * object.scaleY, false);
        this.fabricObjects[1].set({
            left: textPosition.left,
            top: textPosition.top
        });
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
