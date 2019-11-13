import { IShapeNode, ShapeNodeType } from '.';
import { fabric } from 'fabric';
import { ShapeSettings } from '../processshape';

export abstract class FabricShapeExtention implements IShapeNode {
    properties: { [k: string]: any; };
    constructor(uiSettings: ShapeSettings) { };
    abstract readonly shapeNodeType: ShapeNodeType;
    setProperties(options: fabric.IObjectOptions) { };
    abstract readonly schema: fabric.Object;   
}

export interface FabricShapeExtention {

}
