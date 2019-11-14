import fabric from 'fabric/fabric-impl';
import { FabricShapeExtention } from '../fabricshape';
import { IShape } from './IShape';
import { ShapeSettings } from '../ShapeSettings';

export declare abstract class Shape implements IShape {
    name: string;
    readonly nodes: FabricShapeExtention[];
    constructor(settings: ShapeSettings, nodes?: FabricShapeExtention[]);
    abstract readonly schema: Array<fabric.Object>;
    abstract readonly toJson: string;
}

export interface Shape {

}
