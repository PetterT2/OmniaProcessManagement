import { ShapeTemplateSettings } from './ShapeTemplateSettings';
import { FabricShapeData } from '../../../processshape/fabricshape/FabricShapeData';
import { ShapeTemplateType } from '../enums/Enums';

export interface ShapeTemplatePentagonSettings extends ShapeTemplateSettings {
    type: ShapeTemplateType.PentagonShape,
    arrowWidthPercent: number;
    arrowHeightPercent: number;
    isLine: boolean;
}