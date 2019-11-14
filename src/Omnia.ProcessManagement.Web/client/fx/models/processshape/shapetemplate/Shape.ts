import fabric from 'fabric/fabric-impl';
import { IShapeNode } from '../../fabricshape';
import { IShape } from './IShape';
import { DrawingShapeDefination } from '../../data';

export declare abstract class Shape implements IShape {
    name: string;
    defination: DrawingShapeDefination;
    nodes: IShapeNode[];
    constructor(defination: DrawingShapeDefination, nodes: IShapeNode[]);
    abstract schema: Array<fabric.Object>;
}

export interface Shape {

}
