import { ShapeDefinitionTypes, DrawingShapeDefinition } from '..';

export interface DrawingImageShapeDefinition extends DrawingShapeDefinition {
    imageUrl: string;
}