import { ShapeDefination, ShapeDefinationTypes } from './ShapeDefination';
import { TextPosition } from '../..';

export interface DrawingShapeDefination extends ShapeDefination {
    type: ShapeDefinationTypes.Drawing;

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