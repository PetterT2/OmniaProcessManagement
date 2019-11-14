import { IShapeSettings } from '.';
import { Enums } from '../../../core';

export interface ShapeSettings extends IShapeSettings {
    type: Enums.ShapeSettingsType.Shape;
    name: string;
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
