import { FabricShapeExtention } from '.';
import { fabric } from 'fabric';
import { FabricShapeNodeTypes } from './IShapeNode';
import { DrawingShapeDefination } from '../data';

export default class FabricEllipseShape implements FabricShapeExtention {
    properties: { [k: string]: any; };

    constructor(defination: DrawingShapeDefination) {
        this.initProperties(defination);
    }

    private initProperties(defination: DrawingShapeDefination) {
        if (defination) {
            this.properties = {};
            this.properties["tx"] = defination.width / 2;
            this.properties["ry"] = defination.height / 2;
            this.properties["left"] = 0;
            this.properties["top"] = 0;
            this.properties["fill"] = defination.backgroundColor;
            this.properties["borderColor"] = defination.borderColor;
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