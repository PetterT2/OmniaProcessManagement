import { ShapeTemplateSettings } from './ShapeTemplateSettings';
import { FabricShapeData } from '../../../processshape/fabricshape/FabricShapeData';
import { ShapeTemplateType } from '../enums/Enums';

export interface ShapeTemplateFreeformSettings extends ShapeTemplateSettings {
    type: ShapeTemplateType.FreeformShape,
    nodes: FabricShapeData[];
}