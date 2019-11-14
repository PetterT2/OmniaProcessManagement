import { FabricShapeExtention } from '.';
import { FabricShapeNodeTypes } from './IShapeNode';

import { fabric } from 'fabric';
import { DrawingShapeDefination } from '../data';

export default class FabricCircleShape implements FabricShapeExtention {
    properties: { [k: string]: any; };

    constructor(defination: DrawingShapeDefination) {
        this.initProperties(defination);
    }

    private initProperties(defination: DrawingShapeDefination) {
        if (defination) {
            this.properties = {};
            this.properties["radius"] = defination.width / 2;
            this.properties["left"] = 0;
            this.properties["top"] = 0;
            this.properties["fill"] = defination.backgroundColor;
            this.properties["borderColor"] = defination.borderColor;
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