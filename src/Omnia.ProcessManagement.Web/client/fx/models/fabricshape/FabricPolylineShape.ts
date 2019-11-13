import { IShapeNode, ShapeNodeType, FabricShapeExtention } from '.';
import { fabric } from 'fabric';
import { FabricShapeNodeTypes } from './IShapeNode';
import { ShapeSettings } from '../processshape';

export default class FabricPolylineShape implements FabricShapeExtention {
    properties: { [k: string]: any; };
    points: Array<{ x: number; y: number }>;

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

    get shapeNodeType() {
        return FabricShapeNodeTypes.rect;
    }

    setProperties(options: fabric.IPolylineOptions, points?: Array<{ x: number; y: number }>) {
        this.points = points;
        Object.keys(options).forEach(key => {
            if (options[key])
                this.properties[key] = options[key];
        });
    }

    get schema() {
        return new fabric.Polyline(this.points, this.properties);
    }
}