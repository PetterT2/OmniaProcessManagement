import { MultilingualString } from '@omnia/fx-models';
import { DrawingShape, DrawingShapeTypes } from './DrawingShape';

export interface DrawingCustomLinkShape extends DrawingShape {
    type: DrawingShapeTypes.CustomLink;

    link: string;
}