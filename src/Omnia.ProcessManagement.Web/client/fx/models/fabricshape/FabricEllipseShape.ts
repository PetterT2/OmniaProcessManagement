import { FabricShapeExtention } from '.';
import { fabric } from 'fabric';
import { FabricShapeNodeTypes } from './IShapeNode';
import { DrawingShapeDefinition } from '../data';

export default class FabricEllipseShape implements FabricShapeExtention {
    properties: { [k: string]: any; };

    constructor(definition: DrawingShapeDefinition) {
        this.initProperties(definition);
    }

    private initProperties(definition: DrawingShapeDefinition) {
        if (definition) {
            this.properties = {};
            this.properties["tx"] = definition.width / 2;
            this.properties["ry"] = definition.height / 2;
            this.properties["left"] = 0;
            this.properties["top"] = 0;
            this.properties["fill"] = definition.backgroundColor;
            this.properties["borderColor"] = definition.borderColor;
        }
    }

    get shapeNodeType() {
        return FabricShapeNodeTypes.ellipse;
    }

    setProperties(options: fabric.IEllipseOptions) {
        Object.keys(options).forEach(key => {
            if (options[key])
                this.properties[key] = options[key];
        });
    }

    get schema() {
        return new fabric.Ellipse(this.properties);
    }
}