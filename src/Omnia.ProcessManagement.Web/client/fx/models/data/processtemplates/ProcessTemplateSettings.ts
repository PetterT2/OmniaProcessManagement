import { MultilingualString } from '@omnia/fx-models';
import { ShapeDefinition } from '../shapedefinitions';

export interface ProcessTemplateSettings {
    title: MultilingualString;
    shapeDefinitions: Array<ShapeDefinition>;
}