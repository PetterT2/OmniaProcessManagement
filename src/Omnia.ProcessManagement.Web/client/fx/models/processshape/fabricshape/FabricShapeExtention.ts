import { IShapeNode, ShapeNodeType } from './IShapeNode';
import { fabric } from 'fabric';
import { DrawingShapeDefinition } from '../../data';

export declare abstract class FabricShapeExtention implements IShapeNode {
    constructor(definition: DrawingShapeDefinition, isActive: boolean, properties?: { [k: string]: any; });
    properties: { [k: string]: any; };
    fabricObject: fabric.Object;
    abstract getShapeNodeJson(): IShapeNode;
    abstract readonly shapeNodeType: ShapeNodeType;
}

export interface FabricShapeExtention {

}
