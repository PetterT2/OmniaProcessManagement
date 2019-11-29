import { fabric } from 'fabric';
import { Shape } from './Shape';
import { FabricShape, FabricRectShape, FabricTextShape, FabricTriangleShape, IFabricShape, FabricCircleShape, FabricEllipseShape, FabricPolygonShape, FabricShapeType, FabricShapeTypes, FabricPathShape, FabricPolylineShape } from '../fabricshape';
import { DrawingShapeDefinition, TextPosition } from '../../models';
import { ShapeExtension } from './ShapeExtension';
import { MultilingualString } from '@omnia/fx-models';
import { ShapeTemplatesConstants } from '../../constants';

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
        if (this.nodes) {
            var fabricGroupObjects: fabric.Object[] = [];
            var fabricTextObject: fabric.Object;

            let pathNodes = this.nodes.filter(n => n.shapeNodeType == FabricShapeTypes.path);
            let polylineNode = this.nodes.find(n => n.shapeNodeType == FabricShapeTypes.polyline);
            let textNode = this.nodes.find(n => n.shapeNodeType == FabricShapeTypes.text);
            if (polylineNode) {
                let rectShape = new FabricPolylineShape(this.definition, isActive, Object.assign({ selectable: selectable }, polylineNode.properties || {}));
                this.fabricShapes.push(rectShape);
                fabricGroupObjects.push(rectShape.fabricObject);
            }
            if (pathNodes.length > 0) {
                pathNodes.forEach(p => {
                    let pathShape = new FabricPathShape(this.definition, isActive, Object.assign({ selectable: selectable }, p.properties || {}));
                    this.fabricShapes.push(pathShape);
                    fabricGroupObjects.push(pathShape.fabricObject);
                })
            }
            if (textNode) {
                let textShape = new FabricTextShape(this.definition, isActive, Object.assign({ selectable: false }, textNode.properties || {}, title));
                this.fabricShapes.push(textShape);
                fabricTextObject = textShape.fabricObject;
            }
            let group = new fabric.Group(fabricGroupObjects, { selectable: selectable });
            group.toActiveSelection();
            this.fabricObjects.push(group);
            this.fabricObjects.push(fabricTextObject);

        }
        this.fabricShapes.forEach(s => this.fabricObjects.push(s.fabricObject));
        this.nodes = this.fabricShapes.map(n => n.getShapeNodeJson());
    }

    addEventListener(canvas: fabric.Canvas, gridX?: number, gridY?: number) {

    }

}
