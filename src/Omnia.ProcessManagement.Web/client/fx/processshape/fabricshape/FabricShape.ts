import { IFabricShape, FabricShapeTypes } from './IFabricShape';
import { fabric } from 'fabric';
import { DrawingShapeDefinition } from '../../models';

export declare abstract class FabricShape implements IFabricShape {
    constructor(definition: DrawingShapeDefinition, properties?: { [k: string]: any; });
    properties: { [k: string]: any; };
    fabricObject: fabric.Object;
    abstract getShapeNodeJson(): IFabricShape;
    abstract readonly shapeNodeType: FabricShapeTypes;
}

export interface FabricShape {

}
