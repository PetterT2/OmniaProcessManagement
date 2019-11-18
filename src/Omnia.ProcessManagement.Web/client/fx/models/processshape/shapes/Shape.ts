import fabric from 'fabric/fabric-impl';
import { FabricShapeExtention, IShapeNode } from '../fabricshape';
import { IShape } from './IShape';
import { DrawingShapeDefinition } from '../../data';

export declare abstract class Shape implements IShape {
    definition: DrawingShapeDefinition;
    name: string;
    nodes: IShapeNode[];
    readonly shapeObject: fabric.Object[];
    constructor(definition: DrawingShapeDefinition, nodes?: IShapeNode[], text?: string, selectable?: boolean, left?: number, top?: number);
    abstract getShape(): IShape;
    abstract addListenerEvent(canvas: fabric.Canvas, gridX?: number, gridY?: number);
}

export interface Shape {

}
