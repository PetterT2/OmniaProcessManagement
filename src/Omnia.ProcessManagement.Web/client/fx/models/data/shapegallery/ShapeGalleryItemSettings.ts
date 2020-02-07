import { MultilingualString } from '@omnia/fx-models';
import { DrawingShapeDefinition, ShapeTemplate } from '..';

export enum ShapeGalleryItemType {
    Freeform = 1,
    Media = 2
}

export interface ShapeGalleryItemSettings {
    title: MultilingualString,
    shapeDefinition?: DrawingShapeDefinition,
}