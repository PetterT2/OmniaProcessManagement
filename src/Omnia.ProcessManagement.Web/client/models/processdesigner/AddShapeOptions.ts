import { DrawingShapeDefinition, DrawingShapeTypes } from '../../fx/models';
import { MultilingualString, GuidValue } from '@omnia/fx-models';

export interface AddShapeOptions {
    shapeDefinition: DrawingShapeDefinition;
    shapeType: DrawingShapeTypes;
    title: MultilingualString;
    processStepId?: GuidValue;
    customLink?: string;
}