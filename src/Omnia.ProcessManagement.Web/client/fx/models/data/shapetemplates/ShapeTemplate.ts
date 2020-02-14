import { GuidValue, Guid, MultilingualString } from '@omnia/fx-models';
import { ShapeTemplateSettings } from './ShapeTemplateSettings';
import { ShapeTemplateType } from '../enums/Enums';

export interface ShapeTemplate {
    id: GuidValue,
    title: MultilingualString,
    settings: ShapeTemplateSettings,
    builtIn: boolean,

    //client-side
    multilingualTitle: string
}

/**
 * NOTE: whenever an new property is added in settings, we need to define its initial value in factory
 * To ensure it fully react on view
 * */
export const ShapeTemplateFactory = {
    createDefaultShapeTemplate(): ShapeTemplate {
        let shapeTemplate: ShapeTemplate = {
            id: Guid.newGuid(),
            title: { isMultilingualString: true },
            settings: {
                type: ShapeTemplateType.FreeformShape
            },
            builtIn: false
        } as ShapeTemplate

        return shapeTemplate;
    }
}