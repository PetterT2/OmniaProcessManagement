import { MultilingualString } from '@omnia/fx-models';

export enum ShapeDefinitionTypes {
    Heading = 1,
    Drawing = 2
}

export interface ShapeDefinition {
    type: ShapeDefinitionTypes;
    title: MultilingualString;
}