import { MultilingualString, GuidValue } from '@omnia/fx-models';
import { DrawingShape, DrawingShapeTypes } from './DrawingShape';

export interface CustomLinkDrawingShape extends DrawingShape {
    type: DrawingShapeTypes.CustomLink;

    //link: string;//remove this?
    linkId: GuidValue;
}