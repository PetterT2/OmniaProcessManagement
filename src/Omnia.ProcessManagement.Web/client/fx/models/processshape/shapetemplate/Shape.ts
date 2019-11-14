import fabric from 'fabric/fabric-impl';
import { IShapeNode } from '../../fabricshape';
import { IShape } from './IShape';
import { ShapeSettings } from '..';

export declare abstract class Shape implements IShape {
    name: string;
    settings: ShapeSettings;
    nodes: IShapeNode[];
    constructor(settings: ShapeSettings, nodes: IShapeNode[]);
    abstract schema: Array<fabric.Object>;
}

export interface Shape {

}
