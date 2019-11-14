import { IShapeNode, ShapeNodeType, FabricShapeExtention } from '.';
import { fabric } from 'fabric';
import { FabricShapeNodeTypes } from './IShapeNode';
import { DrawingShapeDefinition } from '../../data';

export default class FabricTriangleShape implements FabricShapeExtention {
    properties: { [k: string]: any; };
    fabricObject: fabric.Triangle;

    constructor(definition: DrawingShapeDefinition, properties?: { [k: string]: any; }) {
        this.initProperties(definition, properties);
    }

    private initProperties(definition: DrawingShapeDefinition, properties?: { [k: string]: any; }) {
        if (properties)
            this.properties = properties;
        else if (definition) {
            this.properties = {};
            this.properties["width"] = definition.width
            this.properties["height"] = definition.height;
            this.properties["left"] = 0;
            this.properties["top"] = 0;
            this.properties["fill"] = definition.backgroundColor;
            this.properties["borderColor"] = definition.borderColor;
        }
        this.fabricObject = new fabric.Triangle(this.properties);
    }

    get shapeNodeType() {
        return FabricShapeNodeTypes.triangle;
    }

    setProperties(options: fabric.ITriangleOptions) {
        Object.keys(options).forEach(key => {
            if (options[key])
                this.properties[key] = options[key];
        });
        this.fabricObject = new fabric.Triangle(this.properties);
    }

    get schema() {
        return this.fabricObject;
    }

    toJson(propertiesToInclude?: string[]) {
        return this.fabricObject ? this.fabricObject.toJSON(propertiesToInclude) : null;
    }
}