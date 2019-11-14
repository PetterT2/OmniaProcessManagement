import { FabricShapeExtention } from '.';
import { fabric } from 'fabric';
import { FabricShapeNodeTypes } from './IShapeNode';
import { DrawingShapeDefinition } from '../../data';

export default class FabricImageShape implements FabricShapeExtention {
    properties: { [k: string]: any; };
    fabricObject: fabric.Image;

    constructor(definition: DrawingShapeDefinition, properties?: { [k: string]: any; }) {
        this.initProperties(definition, properties);
    }

    private initProperties(definition: DrawingShapeDefinition, properties?: { [k: string]: any; }) {
        if (properties) {
            this.properties = properties;
        }
        else if (definition) {
            this.properties = {};
            this.properties["left"] = 0;
            this.properties["top"] = 0;
            this.properties["fill"] = definition.backgroundColor;
            this.properties["borderColor"] = definition.borderColor;
            //TO DO
        }
        this.fabricObject = new fabric.Image(this.properties['element'], this.properties);
    }

    get shapeNodeType() {
        return FabricShapeNodeTypes.image;
    }

    setProperties(options: fabric.IImageOptions, element?: string) {
        Object.keys(options).forEach(key => {
            if (options[key])
                this.properties[key] = options[key];
        });
        this.fabricObject = new fabric.Image(element, this.properties);
    }

    get schema() {
        return this.fabricObject;
    }

    toJson(propertiesToInclude?: string[]) {
        return this.fabricObject ? this.fabricObject.toJSON(propertiesToInclude) : null;
    }
}