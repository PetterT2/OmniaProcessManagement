import { ShapeDefinition, ShapeDefinitionTypes } from './ShapeDefinition';
import { TextPosition } from '..';
import { ShapeTemplate } from '../drawingdefinitions';
import { TextAlignment } from '../enums';
import { SpacingSetting } from '@omnia/fx-models';

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
    textAlignment: TextAlignment;
    textHorizontalAdjustment: number;
    textVerticalAdjustment: number;
    fontSize: number;
}