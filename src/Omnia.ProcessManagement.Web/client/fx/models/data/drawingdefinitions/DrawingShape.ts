import { GuidValue, MultilingualString } from '@omnia/fx-models';
import { IShape } from '../../../processshape';

export enum DrawingShapeTypes {
    Undefined = 0,
    ProcessStep = 1,
    CustomLink = 2,
    ExternalProcess = 3
}

export interface DrawingShape {
    id: GuidValue,
    type: DrawingShapeTypes,
    shape: IShape;
    title: MultilingualString;
    processStepId?: GuidValue;
}