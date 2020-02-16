import { GuidValue } from '@omnia/fx-models';
import { ShapeTemplateType, TextAlignment, TextPosition } from '../enums/Enums';

export interface DrawingShapeDefinitionProperties {
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