import { FabricShapeExtention } from '.';
import { FabricShapeNodeTypes } from './IShapeNode';
import { fabric } from 'fabric';
import { ShapeSettings } from '../ShapeSettings';

export default class FabricCircleShape implements FabricShapeExtention {
    properties: { [k: string]: any; };
    fabricObject: fabric.Circle;

    constructor(uiSettings: ShapeSettings, properties?: { [k: string]: any; }) {
        this.initProperties(uiSettings, properties);
    }

    private initProperties(uiSettings: ShapeSettings, properties?: { [k: string]: any; }) {
        if (properties)
            this.properties = properties;
        else if (uiSettings) {
            this.properties = {};
            this.properties["radius"] = uiSettings.width / 2;
            this.properties["left"] = 0;
            this.properties["top"] = 0;
            this.properties["fill"] = uiSettings.backgroundColor;
            this.properties["borderColor"] = uiSettings.borderColor;
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