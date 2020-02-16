import { ShapeDefinition, ShapeDefinitionTypes } from './ShapeDefinition';
import { DrawingShapeDefinitionProperties } from '..';

export interface DrawingShapeDefinition extends ShapeDefinition, DrawingShapeDefinitionProperties {
    type: ShapeDefinitionTypes.Drawing;
}