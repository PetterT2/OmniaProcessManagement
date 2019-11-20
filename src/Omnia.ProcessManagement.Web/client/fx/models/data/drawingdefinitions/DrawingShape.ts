import { IShape } from '../../processshape';
import { GuidValue } from '@omnia/fx-models';

export enum DrawingShapeTypes {
    Undefined = 0,
    ProcessStep = 1,
    CustomLink = 2,
    ExternalProcess = 3
}

export interface DrawingShape {
    id: GuidValue,
    type: DrawingShapeTypes
    shape: IShape;
}