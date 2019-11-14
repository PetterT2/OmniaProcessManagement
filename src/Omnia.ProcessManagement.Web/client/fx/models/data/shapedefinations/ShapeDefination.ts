import { MultilingualString } from '@omnia/fx-models';

export enum ShapeDefinationTypes {
    Heading = 1,
    Drawing = 2
}

export interface ShapeDefination {
    type: ShapeDefinationTypes;
    title: MultilingualString;
}