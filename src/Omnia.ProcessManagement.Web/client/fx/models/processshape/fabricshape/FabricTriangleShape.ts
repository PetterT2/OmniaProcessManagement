﻿import { FabricShapeExtension } from './FabricShapeExtention';
import { fabric } from 'fabric';
import { FabricShapeTypes } from './IFabricShape';
import { DrawingShapeDefinition } from '../../data';
import { FabricShape } from './FabricShape';

export class FabricTriangleShape extends FabricShapeExtension implements FabricShape {
    constructor(definition: DrawingShapeDefinition, isActive: boolean, properties?: { [k: string]: any; }) {
        super(definition, isActive, properties);
        this.fabricObject = new fabric.Triangle(this.properties);
    }

    get shapeNodeType() {
        return FabricShapeTypes.triangle;
    }
}