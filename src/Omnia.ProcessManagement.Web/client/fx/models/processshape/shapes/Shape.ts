import fabric from 'fabric/fabric-impl';
import { FabricShapeExtention } from '../fabricshape';
import { IShape } from './IShape';
import { DrawingShapeDefinition } from '../../data';

export declare abstract class Shape implements IShape {
    name: string;
    readonly nodes: FabricShapeExtention[];
    constructor(settings: DrawingShapeDefinition, nodes?: FabricShapeExtention[]);
    abstract readonly schema: Array<fabric.Object>;
    abstract readonly toJson: string;
}

export interface Shape {

}
