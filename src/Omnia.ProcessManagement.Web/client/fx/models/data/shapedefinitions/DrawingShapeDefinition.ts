import { ShapeDefinition, ShapeDefinitionTypes } from './ShapeDefinition';
import { Enums } from '../../../../core';

export enum TextPosition {
    Above = 1,
    Center = 2,
    Bottom = 3
}

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