import { IShapeNode, ShapeNodeType } from '.';
import { fabric } from 'fabric';
import { DrawingShapeDefination } from '../data';

export abstract class FabricShapeExtention implements IShapeNode {
    properties: { [k: string]: any; };
    constructor(defination: DrawingShapeDefination) { };
    abstract readonly shapeNodeType: ShapeNodeType;
    setProperties(options: fabric.IObjectOptions) { };
    abstract readonly schema: fabric.Object;   
}

export interface FabricShapeExtention {

}
