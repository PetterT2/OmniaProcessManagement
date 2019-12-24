import { fabric } from 'fabric';
import { Shape } from './Shape';
import { FabricShape, FabricRectShape, FabricTextShape, FabricTriangleShape, IFabricShape, FabricCircleShape, FabricEllipseShape, FabricPolygonShape, FabricShapeTypes, FabricPathShape, FabricPolylineShape, FabricLineShape } from '../fabricshape';
import { DrawingShapeDefinition, TextPosition } from '../../models';
import { ShapeExtension } from './ShapeExtension';
import { MultilingualString } from '@omnia/fx-models';
import { ShapeTemplatesConstants, TextSpacingWithShape } from '../../constants';

export class FreeformShape extends ShapeExtension implements Shape {
    constructor(definition: DrawingShapeDefinition, nodes?: IFabricShape[], isActive?: boolean, title?: MultilingualString, selectable?: boolean,
        left?: number, top?: number) {
        super(definition, nodes, isActive, title, selectable, left, top);
    }

    get name() {
        return ShapeTemplatesConstants.Freeform.name;
    }

    protected initNodes(isActive: boolean, title?: MultilingualString, selectable?: boolean, left?: number, top?: number) {
        this.fabricShapes = [];
        let hasLeft: boolean = (left != null && left != undefined) ? true : false;
        let hasTop: boolean = (top != null && top != undefined) ? true : false;
        left = left || 0; top = top || 0;
        left = parseFloat(left.toString());
        top = parseFloat(top.toString());
        let pleft = left, ptop = top;

        if (this.nodes) {
            var fabricGroupObjects: fabric.Object[] = [];
            var fabricTextObject: fabric.Object;

            let pathNodes = this.nodes.filter(n => n.shapeNodeType == FabricShapeTypes.path);
            let polylineNode = this.nodes.find(n => n.shapeNodeType == FabricShapeTypes.polyline);
            let lineNodes = this.nodes.filter(n => n.shapeNodeType == FabricShapeTypes.line);
            let textNode = this.nodes.find(n => n.shapeNodeType == FabricShapeTypes.text) || {
                shapeNodeType: FabricShapeTypes.text, properties: {}
            };

            if (polylineNode) {
                let rectShape = new FabricPolylineShape(this.definition, isActive, Object.assign({ selectable: selectable }, polylineNode.properties || {}));
                this.fabricShapes.push(rectShape);
                fabricGroupObjects.push(rectShape.fabricObject);
            }
            if (lineNodes.length > 0) {
                let lineDefinition: DrawingShapeDefinition = Object.assign({}, this.definition);
                lineDefinition.activeBorderColor = this.definition.activeBackgroundColor;
                lineDefinition.borderColor = this.definition.backgroundColor;

                lineNodes.forEach(p => {
                    let lineShape = new FabricLineShape(lineDefinition, isActive, Object.assign({ selectable: selectable, strokeWidth: 5 }, p.properties || {}));
                    this.fabricShapes.push(lineShape);
                    fabricGroupObjects.push(lineShape.fabricObject);
                })
            }
            if (pathNodes.length > 0) {
                pathNodes.forEach(p => {
                    let pathShape = new FabricPathShape(this.definition, isActive, Object.assign({ selectable: selectable }, p.properties || {}));
                    this.fabricShapes.push(pathShape);
                    fabricGroupObjects.push(pathShape.fabricObject);
                })
            }

            let group = new fabric.Group(fabricGroupObjects, Object.assign({ selectable: selectable }, (left && top) ? { left: pleft, top: ptop } : {}));
            group.toActiveSelection();
            if (hasLeft)
                group.left = left;
            if (hasTop)
                group.top = top;
            if (this.definition.width)
                group.scaleToWidth(this.definition.width);
            if (this.definition.height)
                group.scaleToHeight(this.definition.height);
            this.fabricObjects.push(group);

            if (textNode) {
                let textPosition = this.getObjectPosition(true, group.left, group.top, group.width * group.scaleX, group.height * group.scaleY, true);
                let textShape = new FabricTextShape(this.definition, isActive, Object.assign({ selectable: selectable, left: textPosition.left, top: textPosition.top }, textNode.properties || {}, title));
                this.fabricShapes.push(textShape);
                fabricTextObject = textShape.fabricObject;
                this.fabricObjects.push(fabricTextObject);
            }

        }
    }

}
