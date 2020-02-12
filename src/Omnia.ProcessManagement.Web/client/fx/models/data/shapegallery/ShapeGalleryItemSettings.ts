import { MultilingualString } from '@omnia/fx-models';
import { DrawingShapeDefinition } from '../shapedefinitions';

export interface ShapeGalleryItemSettings {
    title: MultilingualString,
    shapeDefinition: DrawingShapeDefinition
}