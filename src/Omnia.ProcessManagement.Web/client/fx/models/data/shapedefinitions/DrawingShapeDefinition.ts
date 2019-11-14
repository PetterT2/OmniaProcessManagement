import { ShapeDefinition, ShapeDefinitionTypes } from './ShapeDefinition';
import { Enums } from '../../../../core';

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
    textPosition: Enums.TextPosition;
    fontSize: number;
}