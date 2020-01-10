import { ShapeDefinition, ShapeDefinitionTypes } from './ShapeDefinition';
import { TextPosition, DrawingShapeDefinition } from '..';
import { ShapeTemplate } from '../drawingdefinitions';

export interface DrawingImageShapeDefinition extends DrawingShapeDefinition {
    imageUrl: string;
}