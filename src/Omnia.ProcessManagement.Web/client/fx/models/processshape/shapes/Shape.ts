import fabric from 'fabric/fabric-impl';
import { FabricShapeExtention, IShapeNode } from '../fabricshape';
import { IShape } from './IShape';
import { DrawingShapeDefinition } from '../../data';

export declare abstract class Shape implements IShape {
    name: string;
    nodes: IShapeNode[];
    readonly shapeObject: fabric.Group;
    constructor(settings: DrawingShapeDefinition, nodes?: IShapeNode[], text?: string, selectable?: boolean, left?: number, top?: number);
    abstract getShape(): IShape;
}

export interface Shape {

}
