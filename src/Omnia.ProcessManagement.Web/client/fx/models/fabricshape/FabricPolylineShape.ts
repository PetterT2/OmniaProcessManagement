﻿import { IShapeNode, ShapeNodeType, FabricShapeExtention } from '.';
import { fabric } from 'fabric';
import { FabricShapeNodeTypes } from './IShapeNode';
import { DrawingShapeDefinition } from '../data';

export default class FabricPolylineShape implements FabricShapeExtention {
    properties: { [k: string]: any; };
    points: Array<{ x: number; y: number }>;

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