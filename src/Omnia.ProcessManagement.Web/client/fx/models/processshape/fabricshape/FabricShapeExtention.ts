import { IShapeNode, ShapeNodeType } from '.';
import { fabric } from 'fabric';
import { ShapeSettings } from '../ShapeSettings';

export declare abstract class FabricShapeExtention implements IShapeNode {
    constructor(uiSettings: ShapeSettings, properties?: { [k: string]: any; });
    properties: { [k: string]: any; };
    setProperties(options: fabric.IObjectOptions);
    abstract readonly shapeNodeType: ShapeNodeType;
    abstract readonly schema: fabric.Object;
    abstract toJson(propertiesToInclude?: string[]): string;
}

export interface FabricShapeExtention {

}
