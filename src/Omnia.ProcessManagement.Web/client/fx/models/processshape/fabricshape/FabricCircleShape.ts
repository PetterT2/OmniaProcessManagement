import { FabricShapeExtention } from '.';
import { FabricShapeNodeTypes } from './IShapeNode';
import { fabric } from 'fabric';
import { DrawingShapeDefinition } from '../../data';

export default class FabricCircleShape implements FabricShapeExtention {
    properties: { [k: string]: any; };
    fabricObject: fabric.Circle;

    constructor(definition: DrawingShapeDefinition, properties?: { [k: string]: any; }) {
        this.initProperties(definition, properties);
    }

    private initProperties(definition: DrawingShapeDefinition, properties?: { [k: string]: any; }) {
        if (properties)
            this.properties = properties;
        else if (definition) {
            this.properties = {};
            this.properties["radius"] = definition.width / 2;
            this.properties["left"] = 0;
            this.properties["top"] = 0;
            this.properties["fill"] = definition.backgroundColor;
            this.properties["borderColor"] = definition.borderColor;
        }
        this.fabricObject = new fabric.Circle(this.properties);
    }

    setProperties(options: fabric.ICircleOptions) {
        Object.keys(options).forEach(key => {
            if (options[key])
                this.properties[key] = options[key];
        });
        this.fabricObject = new fabric.Circle(this.properties);
    }

    get shapeNodeType() {
        return FabricShapeNodeTypes.circle;
    }

    get schema() {
        return this.fabricObject;
    }

    toJson(propertiesToInclude?: string[]) {
        return this.fabricObject ? this.fabricObject.toJSON(propertiesToInclude) : null;
    }
}