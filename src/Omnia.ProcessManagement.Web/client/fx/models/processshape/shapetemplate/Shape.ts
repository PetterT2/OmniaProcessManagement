import fabric from 'fabric/fabric-impl';
import { IShapeNode } from '../../fabricshape';
import { IShape } from './IShape';
import { DrawingShapeDefinition } from '../../data';

export declare abstract class Shape implements IShape {
    name: string;
    definition: DrawingShapeDefinition;
    nodes: IShapeNode[];
    constructor(definition: DrawingShapeDefinition, nodes: IShapeNode[]);
    abstract schema: Array<fabric.Object>;
}

export interface Shape {

}
