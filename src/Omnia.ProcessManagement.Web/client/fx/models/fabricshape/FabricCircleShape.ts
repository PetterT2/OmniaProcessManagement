import { FabricShapeExtention } from '.';
import { FabricShapeNodeTypes } from './IShapeNode';
import { ShapeSettings } from '../processshape';
import { fabric } from 'fabric';

export default class FabricCircleShape implements FabricShapeExtention {
    properties: { [k: string]: any; };

    constructor(uiSettings: ShapeSettings) {
        this.initProperties(uiSettings);
    }

    private initProperties(uiSettings: ShapeSettings) {
        if (uiSettings) {
            this.properties = {};
            this.properties["radius"] = uiSettings.width / 2;
            this.properties["left"] = 0;
            this.properties["top"] = 0;
            this.properties["fill"] = uiSettings.backgroundColor;
            this.properties["borderColor"] = uiSettings.borderColor;
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