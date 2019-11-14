import { ShapeDefinition, ShapeDefinitionTypes } from './ShapeDefinition';
import { TextPosition } from '../..';

export interface DrawingShapeDefinition extends ShapeDefinition {
    type: ShapeDefinitionTypes.Drawing;

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