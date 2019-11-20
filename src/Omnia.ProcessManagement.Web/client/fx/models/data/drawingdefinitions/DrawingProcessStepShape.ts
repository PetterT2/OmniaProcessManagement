import { DrawingShape, DrawingShapeTypes } from './DrawingShape';
import { GuidValue } from '@omnia/fx-models';

export interface DrawingProcessStepShape extends DrawingShape {
    type: DrawingShapeTypes.ProcessStep;

    processStepId: GuidValue;
}