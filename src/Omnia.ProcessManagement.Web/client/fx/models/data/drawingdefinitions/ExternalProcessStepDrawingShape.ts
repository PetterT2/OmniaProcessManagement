import { GuidValue } from '@omnia/fx-models';
import { DrawingShape, DrawingShapeTypes } from './DrawingShape';

export interface ExternalProcessStepDrawingShape extends DrawingShape {
    type: DrawingShapeTypes.ExternalProcessStep;

    processStepId: GuidValue;
}