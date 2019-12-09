import { fabric } from 'fabric';
import { Shape } from './Shape';
import { FabricShape, FabricShapeTypes, FabricRectShape, FabricTextShape, FabricTriangleShape, IFabricShape } from '../fabricshape';
import { DrawingShapeDefinition, TextPosition } from '../../models';
import { IShape } from './IShape';
import { ShapeExtension } from './ShapeExtension';
import { MultilingualString } from '@omnia/fx-models';
import { ShapeTemplatesConstants, TextSpacingWithShape } from '../../constants';

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

    private initExistingNodes(title: MultilingualString, recDefinition: DrawingShapeDefinition,
        triangleDefinition: DrawingShapeDefinition, isActive: boolean, selectable: boolean) {
        var fabricGroupObjects: fabric.Object[] = [];
        var fabricTextObject: fabric.Object;
        let rectNode = this.nodes.find(n => n.shapeNodeType == FabricShapeTypes.rect);
        let triangleNode = this.nodes.find(n => n.shapeNodeType == FabricShapeTypes.triangle);
        let textNode = this.nodes.find(n => n.shapeNodeType == FabricShapeTypes.text);
        if (rectNode) {
            let rectShape = new FabricRectShape(recDefinition, isActive, Object.assign({ selectable: selectable }, rectNode.properties || {}));
            this.fabricShapes.push(rectShape);
            fabricGroupObjects.push(rectShape.fabricObject);
        }
        if (triangleNode) {
            let triangleShape = new FabricTriangleShape(triangleDefinition, isActive, Object.assign({ selectable: selectable }, triangleNode.properties || {}));
            this.fabricShapes.push(triangleShape);
            fabricGroupObjects.push(triangleShape.fabricObject);
        }
        if (textNode) {
            let textShape = new FabricTextShape(this.definition, isActive, Object.assign({ selectable: selectable }, textNode.properties || {}, title));
            this.fabricShapes.push(textShape);
            fabricTextObject = textShape.fabricObject;
        }
        this.fabricObjects.push(new fabric.Group(fabricGroupObjects, { selectable: selectable }));
        this.fabricObjects.push(fabricTextObject);
    }

    protected initNodes(isActive: boolean, title?: MultilingualString, selectable?: boolean, left?: number, top?: number) {
        let triangleWidth = Math.floor(this.definition.height / 2);
        let triangleDefinition: DrawingShapeDefinition = Object.assign({}, this.definition);
        triangleDefinition.width = this.definition.height + 1;
        triangleDefinition.height = triangleWidth - 0.5;
        let recDefinition: DrawingShapeDefinition = Object.assign({}, this.definition);
        recDefinition.width = this.definition.width - triangleWidth;

        if (this.nodes) {
            this.initExistingNodes(title, recDefinition, triangleDefinition, isActive, selectable);
        }
        else if (this.definition) {
            left = left || 0; top = top || 0;
            left = parseFloat(left.toString());
            top = parseFloat(top.toString());
            let recleft = left, rectop = top, tleft = recleft + TextSpacingWithShape,
                ttop = top, trleft = this.definition.width + left, trtop = top;

            switch (this.definition.textPosition) {
                case TextPosition.Center:
                    ttop += Math.floor(this.definition.height / 2 - this.definition.fontSize / 2 - 2);
                    break;
                case TextPosition.Bottom:
                    ttop += this.definition.height + TextSpacingWithShape;
                    break;
                default:
                    rectop += this.definition.fontSize + TextSpacingWithShape;
                    trtop = rectop - 1;
                    break;
            }
            let daskArray = [recDefinition.width, recDefinition.height, recDefinition.width + recDefinition.height, recDefinition.width];
            let triangleDaskArray = [(Math.floor(Math.sqrt(Math.pow(triangleDefinition.height, 2) * 2))) * 2 + 1];

            this.fabricShapes.push(new FabricRectShape(recDefinition, isActive, { strokeDashArray: daskArray, left: recleft, top: rectop, selectable: selectable }));
            this.fabricShapes.push(new FabricTriangleShape(triangleDefinition, isActive, { strokeDashArray: triangleDaskArray, left: trleft, top: trtop, selectable: selectable, angle: 90 }));
            this.fabricShapes.push(new FabricTextShape(this.definition, isActive, { originX: 'left', left: tleft, top: ttop, selectable: selectable }, title));

            this.fabricObjects.push(new fabric.Group([this.fabricShapes[0].fabricObject, this.fabricShapes[1].fabricObject], { selectable: selectable, left: recleft, top: rectop, hoverCursor: "pointer" }));
            this.fabricObjects.push(this.fabricShapes[2].fabricObject);
        }
    }

    getShapeJson(): IShape {
        (this.fabricObjects[0] as fabric.Group).ungroupOnCanvas();
        return {
            name: this.name,
            nodes: this.fabricShapes ? this.fabricShapes.map(n => n.getShapeNodeJson()) : [],
            definition: this.definition
        }
    }
}
