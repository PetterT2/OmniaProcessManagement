import { IShapeNode, ShapeNodeType, FabricShapeExtention } from '.';
import { fabric } from 'fabric';
import { FabricShapeNodeTypes } from './IShapeNode';
import { DrawingShapeDefinition } from '../data';

export default class FabricTriangleShape implements FabricShapeExtention {
    properties: { [k: string]: any; };

    constructor(definition: DrawingShapeDefinition) {
        this.initProperties(definition);
    }

    private initProperties(definition: DrawingShapeDefinition) {
        if (definition) {
            this.properties = {};
            this.properties["width"] = definition.width
            this.properties["height"] = definition.height;
            this.properties["left"] = 0;
            this.properties["top"] = 0;
            this.properties["fill"] = definition.backgroundColor;
            this.properties["borderColor"] = definition.borderColor;
        }
    }

    get shapeNodeType() {
        return FabricShapeNodeTypes.rect;
    }

    setProperties(options: fabric.ITriangleOptions) {
        Object.keys(options).forEach(key => {
            if (options[key])
                this.properties[key] = options[key];
        });
    }

    get schema() {
        return new fabric.Triangle(this.properties);
    }
}