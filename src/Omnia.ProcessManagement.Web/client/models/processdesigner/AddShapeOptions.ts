import { DrawingShapeDefinition, DrawingShapeTypes } from '../../fx/models';
import { MultilingualString, GuidValue } from '@omnia/fx-models';
import { IFabricShape } from '../../fx';

export interface DrawingShapeOptions {
    id?: GuidValue;
    shapeDefinition: DrawingShapeDefinition;
    shapeType: DrawingShapeTypes;
    title: MultilingualString;
    processStepId?: GuidValue;
    customLinkId?: GuidValue;
    nodes?: IFabricShape[];
}