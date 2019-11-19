import { MultilingualString, GuidValue } from '@omnia/fx-models';
import { DrawingShape, DrawingShapeTypes } from './DrawingShape';

export interface DrawingExternalProcessShape extends DrawingShape {
    type: DrawingShapeTypes.ExternalProcess;

    opmProcessId: GuidValue;
}