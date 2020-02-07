import { MultilingualString } from '@omnia/fx-models';
import { IShape } from '../../..';
import { TextPosition, TextAlignment, DrawingShapeDefinition } from '..';

export enum ShapeGalleryItemType {
    Freeform = 1,
    Media = 2
}

export interface ShapeGalleryItemSettings {
    title: MultilingualString,
    type: ShapeGalleryItemType,
    shapeDefinition?: DrawingShapeDefinition,

}