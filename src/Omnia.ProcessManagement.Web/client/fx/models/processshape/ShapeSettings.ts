import { IShapeSettings } from '.';
import { TextPosition, ShapeSettingsType } from '../Enums';
import { MultilingualString, GuidValue } from '@omnia/fx-models';
import { IShapeNode } from '../fabricshape';

export interface ShapeSettings extends IShapeSettings {
    type: ShapeSettingsType.Shape;
    name: string;
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
