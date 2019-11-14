import { MultilingualString } from '@omnia/fx-models';
import { ShapeDefination } from '../shapedefinations';

export interface ProcessTemplateSettings {
    title: MultilingualString;
    shapeDefinations: Array<ShapeDefination>;
}