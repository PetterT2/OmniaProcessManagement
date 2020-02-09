import { MultilingualString } from '@omnia/fx-models';
import { ShapeDefinition } from '..';

export enum ShapeGalleryItemType {
    Freeform = 1,
    Media = 2
}

export interface ShapeGalleryItemSettings {
    title: MultilingualString,
    shapeDefinition?: ShapeDefinition
}