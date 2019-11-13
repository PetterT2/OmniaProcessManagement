import { GuidValue, MultilingualString } from '@omnia/fx-models';
import { ShapeNodeType } from '../fabricshape';

export type ShapeTemplate = {
    id: GuidValue;
    name: string;
    title: MultilingualString;
}