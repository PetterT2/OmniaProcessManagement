import { IShapeNode, ShapeNodeType, FabricShapeExtention } from '.';
import { fabric } from 'fabric';
import { FabricShapeNodeTypes } from './IShapeNode';
import { DrawingShapeDefination } from '../data';

export default class FabricRectShape implements FabricShapeExtention {
    properties: { [k: string]: any; };

    constructor(defination: DrawingShapeDefination) {
        this.initProperties(defination);
    }

    private initProperties(defination: DrawingShapeDefination) {
        if (defination) {
            this.properties = {};
            this.properties["width"] = defination.width
            this.properties["height"] = defination.height;
            this.properties["left"] = 0;
            this.properties["top"] = 0;
            this.properties["fill"] = defination.backgroundColor;
            this.properties["borderColor"] = defination.borderColor;
        }
    }

    get shapeNodeType() {
        return FabricShapeNodeTypes.rect;
    }

    setProperties(options: fabric.IRectOptions) {
        Object.keys(options).forEach(key => {
            if (options[key])
                this.properties[key] = options[key];
        });
    }

    get schema() {
        return new fabric.Rect(this.properties);
    }
}