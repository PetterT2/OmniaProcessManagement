import { IShapeNode, ShapeNodeType, FabricShapeExtention } from '.';
import { fabric } from 'fabric';
import { FabricShapeNodeTypes } from './IShapeNode';
import { ShapeSettings } from '../ShapeSettings';

export default class FabricPolylineShape implements FabricShapeExtention {
    properties: { [k: string]: any; };
    fabricObject: fabric.Polyline;

    constructor(uiSettings: ShapeSettings, properties?: { [k: string]: any; }) {
        this.initProperties(uiSettings, properties);
    }

    private initProperties(uiSettings: ShapeSettings, properties?: { [k: string]: any; }) {
        if (properties) {
            this.properties = properties;
        }
        else if (uiSettings) {
            this.properties = {};
            this.properties["radius"] = uiSettings.width / 2;
            this.properties["left"] = 0;
            this.properties["top"] = 0;
            this.properties["fill"] = uiSettings.backgroundColor;
            this.properties["borderColor"] = uiSettings.borderColor;
        }
        this.fabricObject = new fabric.Polyline(this.properties['points'], this.properties);
    }

    get shapeNodeType() {
        return FabricShapeNodeTypes.polyline;
    }

    setProperties(options: fabric.IPolylineOptions, points?: Array<{ x: number; y: number }>) {
        Object.keys(options).forEach(key => {
            if (options[key])
                this.properties[key] = options[key];
        });
        this.fabricObject = new fabric.Polyline(points, this.properties);
    }

    get schema() {
        return this.fabricObject;
    }

    toJson(propertiesToInclude?: string[]) {
        return this.fabricObject ? this.fabricObject.toJSON(propertiesToInclude) : null;
    }
}