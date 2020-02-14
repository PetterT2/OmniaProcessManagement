import { ShapeTemplateSettings } from './ShapeTemplateSettings';
import { ShapeTemplateType } from '../enums/Enums';

export interface ShapeTemplateMediaSettings extends ShapeTemplateSettings {
    type: ShapeTemplateType.MediaShape,
    imageUrl: string
}