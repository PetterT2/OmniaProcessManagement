import { fabric } from 'fabric';
import { Shape } from './Shape';
import { ShapeTemplatesConstants, TextSpacingWithShape } from '../../../constants';
import { FabricShapeExtention, FabricRectShape, FabricTextShape, FabricTriangleShape, IShapeNode, FabricCircleShape, FabricEllipseShape, FabricPolygonShape, ShapeNodeType, FabricShapeNodeTypes } from '../fabricshape';
import { DrawingShapeDefinition, TextPosition } from '../../data';
import { IShape } from './IShape';

export class FreeformShape implements Shape {
    definition: DrawingShapeDefinition;
    nodes: IShapeNode[];
    private fabricShapes: Array<FabricShapeExtention> = [];
    private fabricObjects: fabric.Object[] = [];
    private grouping: boolean = false;

    constructor(definition: DrawingShapeDefinition, nodes?: IShapeNode[], isActive?: boolean, text?: string, selectable?: boolean,
        left?: number, top?: number, grouping?: boolean) {
        this.definition = definition;
        this.nodes = nodes;
        this.grouping = grouping;
        this.initNodes(isActive || false, selectable || false);
    }

    get name() {
        return ShapeTemplatesConstants.Pentagon.name;
    }

    ready(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            resolve(true);
        })
    }

    private initNodes(isActive: boolean, selectable: boolean) {
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

    private getObjectClass(node: IShapeNode, isActive: boolean, selectable: boolean): FabricShapeExtention {
        switch (node.shapeNodeType) {
            case FabricShapeNodeTypes.circle:
                return new FabricCircleShape(this.definition, isActive, Object.assign({ selectable: selectable }, node.properties || {}));
            case FabricShapeNodeTypes.ellipse:
                return new FabricEllipseShape(this.definition, isActive, Object.assign({ selectable: selectable }, node.properties || {}));
            case FabricShapeNodeTypes.polygon:
                return new FabricPolygonShape(this.definition, isActive, Object.assign({ selectable: selectable }, node.properties || {}));
            case FabricShapeNodeTypes.text:
                return new FabricTextShape(this.definition, isActive, Object.assign({ selectable: selectable }, node.properties || {}));
            case FabricShapeNodeTypes.triangle:
                return new FabricTriangleShape(this.definition, isActive, Object.assign({ selectable: selectable }, node.properties || {}));
            case FabricShapeNodeTypes.rect:
                return new FabricRectShape(this.definition, isActive, Object.assign({ selectable: selectable }, node.properties || {}));
        }
    }

    get shapeObject(): fabric.Object[] {
        return this.fabricObjects;
    }

    getShapeJson(): IShape {
        return {
            name: this.name,
            nodes: this.fabricShapes ? this.fabricShapes.map(n => n.getShapeNodeJson()) : [],
            definition: this.definition
        }
    }

    addEventListener(canvas: fabric.Canvas, gridX?: number, gridY?: number) {

    }

}
