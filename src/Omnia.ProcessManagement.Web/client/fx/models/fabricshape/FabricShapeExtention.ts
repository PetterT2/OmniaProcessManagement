import { IShapeNode, ShapeNodeType } from '.';
import { fabric } from 'fabric';
import { DrawingShapeDefinition } from '../data';

export abstract class FabricShapeExtention implements IShapeNode {
    properties: { [k: string]: any; };
    constructor(definition: DrawingShapeDefinition) { };
    abstract readonly shapeNodeType: ShapeNodeType;
    setProperties(options: fabric.IObjectOptions) { };
    abstract readonly schema: fabric.Object;   
}

export interface FabricShapeExtention {

}
