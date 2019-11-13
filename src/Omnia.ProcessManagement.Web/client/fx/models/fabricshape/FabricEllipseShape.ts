import { FabricShapeExtention } from '.';
import { fabric } from 'fabric';
import { FabricShapeNodeTypes } from './IShapeNode';
import { ShapeSettings } from '../processshape';

export default class FabricEllipseShape implements FabricShapeExtention {
    properties: { [k: string]: any; };

    constructor(uiSettings: ShapeSettings) {
        this.initProperties(uiSettings);
    }

    private initProperties(uiSettings: ShapeSettings) {
        if (uiSettings) {
            this.properties = {};
            this.properties["tx"] = uiSettings.width / 2;
            this.properties["ry"] = uiSettings.height / 2;
            this.properties["left"] = 0;
            this.properties["top"] = 0;
            this.properties["fill"] = uiSettings.backgroundColor;
            this.properties["borderColor"] = uiSettings.borderColor;
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