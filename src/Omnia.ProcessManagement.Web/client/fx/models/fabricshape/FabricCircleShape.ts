import { FabricShapeExtention } from '.';
import { FabricShapeNodeTypes } from './IShapeNode';

import { fabric } from 'fabric';
import { DrawingShapeDefinition } from '../data';

export default class FabricCircleShape implements FabricShapeExtention {
    properties: { [k: string]: any; };

    constructor(definition: DrawingShapeDefinition) {
        this.initProperties(definition);
    }

    private initProperties(definition: DrawingShapeDefinition) {
        if (definition) {
            this.properties = {};
            this.properties["radius"] = definition.width / 2;
            this.properties["left"] = 0;
            this.properties["top"] = 0;
            this.properties["fill"] = definition.backgroundColor;
            this.properties["borderColor"] = definition.borderColor;
        }
    }

    setProperties(options: fabric.ICircleOptions) {
        Object.keys(options).forEach(key => {
            if (options[key])
                this.properties[key] = options[key];
        });
    }

    get shapeNodeType() {
        return FabricShapeNodeTypes.circle;
    }

    get schema() {
        return new fabric.Circle(this.properties);
    }
}