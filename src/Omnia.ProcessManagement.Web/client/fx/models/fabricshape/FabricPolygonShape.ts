import { IShapeNode, ShapeNodeType, FabricShapeExtention } from '.';
import { fabric } from 'fabric';
import { FabricShapeNodeTypes } from './IShapeNode';
import { DrawingShapeDefination } from '../data';

export default class FabricPolygonShape implements FabricShapeExtention {
    properties: { [k: string]: any; };
    points: Array<{ x: number; y: number }>;

    constructor(defination: DrawingShapeDefination) {
        this.initProperties(defination);
    }

    private initProperties(defination: DrawingShapeDefination) {
        if (defination) {
            this.properties = {};
            this.properties["path"] = [];
            this.properties["left"] = 0;
            this.properties["top"] = 0;
            this.properties["fill"] = defination.backgroundColor;
            this.properties["borderColor"] = defination.borderColor;
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
        return new fabric.Polygon(this.points, this.properties);
    }
}