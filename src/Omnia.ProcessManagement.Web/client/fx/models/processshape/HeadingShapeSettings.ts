import { IShapeSettings } from '.';
import { MultilingualString } from '@omnia/fx-models';
import { Enums } from '../../../core';

export interface HeadingShapeSettings extends IShapeSettings {
    type: Enums.ShapeSettingsType.Heading;
}