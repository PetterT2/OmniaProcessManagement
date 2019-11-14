import { MultilingualString } from '@omnia/fx-models';
import { ShapeSettingsType } from '..';

export interface IShapeSettings {
    type: ShapeSettingsType;
    title: MultilingualString;
}