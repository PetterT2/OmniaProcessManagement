import { FabricShapeData, FabricShapeDataTypes } from './FabricShapeData';
import { fabric } from 'fabric';
import { DrawingShapeDefinition } from '../../models';

export declare abstract class FabricShape implements FabricShapeData {
    constructor(definition: DrawingShapeDefinition, properties?: { [k: string]: any; });
    properties: { [k: string]: any; };
    fabricObject: fabric.Object;
    abstract getShapeNodeJson(): FabricShapeData;
    abstract readonly fabricShapeDataType: FabricShapeDataTypes;
}

export interface FabricShape {

}
