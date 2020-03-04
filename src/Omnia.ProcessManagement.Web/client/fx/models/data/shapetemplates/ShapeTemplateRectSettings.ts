import { ShapeTemplateSettings } from './ShapeTemplateSettings';
import { FabricShapeData } from '../../../processshape/fabricshape/FabricShapeData';
import { ShapeTemplateType } from '../enums/Enums';

export interface ShapeTemplateRectSettings extends ShapeTemplateSettings {
    roundX: number;
    roundY: number;
}