import { IFabricShape } from '../fabricshape';
import { DrawingShapeDefinition } from '../..';

export interface IShape {
    name: string;
    nodes: IFabricShape[];
    definition: DrawingShapeDefinition;
}
