import { IShape } from '../../processshape';
import { GuidValue } from '@omnia/fx-models';

export interface IDrawingShapeNode {
    id: GuidValue,
    shape: IShape;
}