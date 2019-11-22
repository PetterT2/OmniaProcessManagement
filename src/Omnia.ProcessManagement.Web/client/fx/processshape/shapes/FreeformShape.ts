import { fabric } from 'fabric';
import { Shape } from './Shape';
import { FabricShape, FabricRectShape, FabricTextShape, FabricTriangleShape, IFabricShape, FabricCircleShape, FabricEllipseShape, FabricPolygonShape, FabricShapeType, FabricShapeTypes } from '../fabricshape';
import { DrawingShapeDefinition, TextPosition } from '../../models';
import { ShapeExtension } from './ShapeExtension';
import { MultilingualString } from '@omnia/fx-models';
import { ShapeTemplatesConstants } from '../../constants';

export class FreeformShape extends ShapeExtension implements Shape {
    private grouping: boolean = false;
    constructor(definition: DrawingShapeDefinition, nodes?: IFabricShape[], isActive?: boolean, title?: MultilingualString, selectable?: boolean,
        left?: number, top?: number) {
        super(definition, nodes, isActive, title, selectable, left, top);
    }

    get name() {
        return ShapeTemplatesConstants.Pentagon.name;
    }

    protected initNodes(isActive: boolean, title?: MultilingualString, selectable?: boolean, left?: number, top?: number) {
        this.fabricShapes = [];
        var fabricGroupObjects: fabric.Object[] = [];
        if (this.nodes) {
            this.nodes.forEach(node => {
                let shape = this.getObjectClass(node, isActive, selectable);
                this.fabricShapes.push(shape);
                fabricGroupObjects.push(shape.fabricObject);
            });
        }
        if (this.grouping)
            this.fabricObjects.push(new fabric.Group(fabricGroupObjects, { selectable: selectable }));
        else
            this.fabricObjects = fabricGroupObjects;
        this.nodes = this.fabricShapes.map(n => n.getShapeNodeJson());
    }

    private getObjectClass(node: IFabricShape, isActive: boolean, selectable: boolean): FabricShape {
        switch (node.shapeNodeType) {
            case FabricShapeTypes.circle:
                return new FabricCircleShape(this.definition, isActive, Object.assign({ selectable: selectable }, node.properties || {}));
            case FabricShapeTypes.ellipse:
                return new FabricEllipseShape(this.definition, isActive, Object.assign({ selectable: selectable }, node.properties || {}));
            case FabricShapeTypes.polygon:
                return new FabricPolygonShape(this.definition, isActive, Object.assign({ selectable: selectable }, node.properties || {}));
            case FabricShapeTypes.text:
                return new FabricTextShape(this.definition, isActive, Object.assign({ selectable: selectable }, node.properties || {}));
            case FabricShapeTypes.triangle:
                return new FabricTriangleShape(this.definition, isActive, Object.assign({ selectable: selectable }, node.properties || {}));
            case FabricShapeTypes.rect:
                return new FabricRectShape(this.definition, isActive, Object.assign({ selectable: selectable }, node.properties || {}));
        }
    }

    addEventListener(canvas: fabric.Canvas, gridX?: number, gridY?: number) {

    }

}
