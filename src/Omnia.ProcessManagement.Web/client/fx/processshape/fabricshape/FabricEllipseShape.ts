﻿import { fabric } from 'fabric';
import { FabricShapeTypes } from './IFabricShape';
import { DrawingShapeDefinition } from '../../models';
import { FabricShape } from './FabricShape';
import { FabricShapeExtension } from './FabricShapeExtention';

export class FabricEllipseShape extends FabricShapeExtension implements FabricShape {    
    constructor(definition: DrawingShapeDefinition, properties?: { [k: string]: any; }) {
        super(definition, properties);
        this.initEllipseProperties(definition);
    }

    private initEllipseProperties(definition: DrawingShapeDefinition) {        
        if (definition) {
            this.properties["tx"] = definition.width / 2;
            this.properties["ry"] = definition.height / 2;
        }
        this.fabricObject = new fabric.Ellipse(this.properties);
    }

    get shapeNodeType() {
        return FabricShapeTypes.ellipse;
    }
}