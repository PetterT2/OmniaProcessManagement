import { IFabricShape } from '../fabricshape';
import { DrawingShapeDefinition } from '../../models';

export interface IShape {
    name: string;
    nodes: IFabricShape[];
    definition: DrawingShapeDefinition;
}
