import { MultilingualString } from '@omnia/fx-models';

export enum ShapeDefinitionTypes {
    Heading = 1,
    Drawing = 2
}

export interface ShapeDefinition {
    type: ShapeDefinitionTypes;
    title: MultilingualString;

    //client-side
    multilingualTitle: string
}

/**
 * NOTE: whenever an new property is added in settings, we need to define its initial value in factory
 * To ensure it fully react on view
 * */
export const ShapeDefinitionFactory = {
    createDefaultProcessTemplate(type?: ShapeDefinitionTypes): ShapeDefinition {
        let shapeDefinition: ShapeDefinition = {
            type: type ? type : ShapeDefinitionTypes.Drawing,
            title: { isMultilingualString: true }
        } as ShapeDefinition

        return shapeDefinition;
    }
}