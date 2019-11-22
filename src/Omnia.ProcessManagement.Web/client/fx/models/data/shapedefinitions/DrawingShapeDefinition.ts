import { ShapeDefinition, ShapeDefinitionTypes } from './ShapeDefinition';
import { TextPosition } from '..';
import { ShapeTemplate } from '../drawingdefinitions';

export interface DrawingShapeDefinition extends ShapeDefinition {
    type: ShapeDefinitionTypes.Drawing;

    shapeTemplate: ShapeTemplate;
    backgroundColor: string;
    borderColor: string;
    textColor: string;
    activeBackgroundColor: string;
    activeBorderColor: string;
    activeTextColor: string;
    width: number;
    height: number;
    textPosition: TextPosition;
    fontSize: number;
}