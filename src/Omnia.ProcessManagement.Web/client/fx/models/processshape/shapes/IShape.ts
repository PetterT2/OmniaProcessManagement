import { IShapeNode } from '../fabricshape';
import { DrawingShapeDefinition } from '../..';

export interface IShape {
    name: string;
    nodes: IShapeNode[];
    definition: DrawingShapeDefinition;
}
