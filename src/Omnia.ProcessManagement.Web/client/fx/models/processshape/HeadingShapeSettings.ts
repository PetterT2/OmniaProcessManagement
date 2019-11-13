import { IShapeSettings } from '.';
import { MultilingualString } from '@omnia/fx-models';
import { ShapeSettingsType } from '../Enums';

export interface HeadingShapeSettings extends IShapeSettings {
    type: ShapeSettingsType.Heading;
}