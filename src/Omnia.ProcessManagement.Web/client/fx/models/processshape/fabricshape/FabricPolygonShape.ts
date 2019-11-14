import { IShapeNode, ShapeNodeType, FabricShapeExtention } from '.';
import { fabric } from 'fabric';
import { FabricShapeNodeTypes } from './IShapeNode';
import { DrawingShapeDefinition } from '../../data';

export default class FabricPolygonShape implements FabricShapeExtention {
    properties: { [k: string]: any; };
    fabricObject: fabric.Polygon;

    constructor(definition: DrawingShapeDefinition, properties?: { [k: string]: any; }) {
        this.initProperties(definition, properties);
    }

    private initProperties(definition: DrawingShapeDefinition, properties?: { [k: string]: any; }) {
        if (properties) {
            this.properties = properties;
        }
        else if (definition) {
            this.properties = {};
            this.properties["points"] = [];
            this.properties["left"] = 0;
            this.properties["top"] = 0;
            this.properties["fill"] = definition.backgroundColor;
            this.properties["borderColor"] = definition.borderColor;
        }
        this.fabricObject = new fabric.Polygon(this.properties['points'], this.properties);
    }

    get shapeNodeType() {
        return FabricShapeNodeTypes.polygon;
    }

    setProperties(options: fabric.IPolylineOptions, points?: Array<{ x: number; y: number }>) {
        Object.keys(options).forEach(key => {
            if (options[key])
                this.properties[key] = options[key];
        });
        this.fabricObject= new fabric.Polygon(points, this.properties);
    }

    get schema() {
        return this.fabricObject;
    }

    toJson(propertiesToInclude?: string[]) {
        return this.fabricObject ? this.fabricObject.toJSON(propertiesToInclude) : null;
    }
}