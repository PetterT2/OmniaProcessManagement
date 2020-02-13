import { ShapeDefinition, ShapeDefinitionTypes } from './ShapeDefinition';
import { TextPosition } from '..';
import { TextAlignment, ShapeTemplateType } from '../enums';
import { GuidValue } from '@omnia/fx-models';

export interface DrawingShapeDefinition extends ShapeDefinition {
    type: ShapeDefinitionTypes.Drawing;

    shapeTemplateId: GuidValue;
    shapeTemplateType: ShapeTemplateType; // To quickly get shapeTemplateName
    backgroundColor: string;
    borderColor: string;
    textColor: string;
    hoverBackgroundColor: string;
    hoverBorderColor: string;
    hoverTextColor: string;
    selectedBackgroundColor: string,
    selectedBorderColor: string,
    selectedTextColor: string,
    width: number;
    height: number;
    textPosition: TextPosition;
    textAlignment: TextAlignment;
    textHorizontalAdjustment: number;
    textVerticalAdjustment: number;
    fontSize: number;
}