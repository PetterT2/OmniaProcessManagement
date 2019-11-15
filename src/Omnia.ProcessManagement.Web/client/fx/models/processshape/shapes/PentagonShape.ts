import { fabric } from 'fabric';
import { Shape } from './Shape';
import { ShapeTemplatesConstants, TextSpacingWithShape } from '../../../constants';
import { FabricShapeExtention, FabricShapeNodeTypes, FabricRectShape, FabricTextShape, FabricTriangleShape, IShapeNode } from '../fabricshape';
import { DrawingShapeDefinition, TextPosition } from '../../data';
import { IShape } from './IShape';

export class PentagonShape implements Shape {
    nodes: IShapeNode[];
    private fabricShapes: Array<FabricShapeExtention> = [];
    private fabricObjects: fabric.Object[] = [];

    constructor(definition: DrawingShapeDefinition, nodes?: IShapeNode[], text?: string, selectable?: boolean, left?: number, top?: number) {
        this.initNodes(definition, nodes, text, selectable, left, top);
    }

    get name() {
        return ShapeTemplatesConstants.Pentagon.name;
    }

    private initNodes(definition: DrawingShapeDefinition, nodes?: IShapeNode[], text?: string, selectable?: boolean, left?: number, top?: number) {
        this.fabricShapes = [];
        var fabricGroupObjects: fabric.Object[] = [];
        var fabricTextObject: fabric.Object;
        if (nodes) {
            let rectNode = nodes.find(n => n.shapeNodeType == FabricShapeNodeTypes.rect);
            let triangleNode = nodes.find(n => n.shapeNodeType == FabricShapeNodeTypes.triangle);
            let textNode = nodes.find(n => n.shapeNodeType == FabricShapeNodeTypes.text);
            if (rectNode) {
                let rectShape = new FabricRectShape(definition, Object.assign({ selectable: selectable }, rectNode.properties || {}));
                this.fabricShapes.push(rectShape);
                fabricGroupObjects.push(rectShape.fabricObject);
            }
            if (triangleNode) {
                let triangleShape = new FabricTriangleShape(definition, Object.assign({ selectable: selectable }, triangleNode.properties || {}));
                this.fabricShapes.push(triangleShape);
                fabricGroupObjects.push(triangleShape.fabricObject);
            }
            if (textNode) {
                let textShape = new FabricTextShape(definition, Object.assign({ selectable: selectable }, textNode.properties || {}));
                this.fabricShapes.push(textShape);
                fabricTextObject = textShape.fabricObject;
            }
        }
        else if (definition) {
            left = left || 0; top = top || 0;
            let triangleWidth = Math.floor(definition.height / 2);
            let recleft = left, rectop = top, tleft = left, ttop = top, trleft = definition.width + left, trtop = top;

            let triangleDefinition: DrawingShapeDefinition = Object.assign({}, definition);
            triangleDefinition.width = definition.height + 1;
            triangleDefinition.height = triangleWidth - 0.5;

            let recDefinition: DrawingShapeDefinition = Object.assign({}, definition);
            recDefinition.width = definition.width - triangleWidth;

            switch (definition.textPosition) {
                case TextPosition.Center:
                    tleft += TextSpacingWithShape;
                    ttop += Math.floor(definition.height / 2 - definition.fontSize / 2 - 2);
                    break;
                case TextPosition.Bottom:
                    ttop += definition.height + TextSpacingWithShape;
                    break;
                default:
                    rectop += definition.fontSize + TextSpacingWithShape;
                    trtop += rectop - 1;
                    break;
            }

            this.fabricShapes.push(new FabricRectShape(recDefinition, { left: recleft, top: rectop, selectable: selectable }));
            this.fabricShapes.push(new FabricTriangleShape(triangleDefinition, { left: trleft, top: trtop, selectable: selectable, angle: 90 }));
            this.fabricShapes.push(new FabricTextShape(definition, { left: tleft, top: ttop, selectable: selectable, text: text || "Sample Text" }));

            fabricGroupObjects = [this.fabricShapes[0].fabricObject, this.fabricShapes[1].fabricObject];
            fabricTextObject = this.fabricShapes[2].fabricObject;
        }
        this.fabricObjects.push(new fabric.Group(fabricGroupObjects, { selectable: selectable }));
        this.fabricObjects.push(fabricTextObject);
    }

    get shapeObject(): fabric.Object[] {
        return this.fabricObjects;
    }

    getShape(): IShape {
        return {
            name: this.name,
            nodes: this.fabricShapes ? this.fabricShapes.map(n => n.getShapeNode()) : []
        }
    }
}
