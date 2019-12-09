import { MultilingualString, GuidValue, Guid } from '@omnia/fx-models';
import { OmniaTheming } from '@omnia/fx/ux';
import { DrawingShapeDefinition } from './DrawingShapeDefinition';
import { ShapeTemplatesConstants } from '../../../constants';

export enum ShapeDefinitionTypes {
    Heading = 1,
    Drawing = 2
}

export interface ShapeDefinition {
    id: GuidValue;//todo
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
    createDefaultProcessTemplate(theming: OmniaTheming, type?: ShapeDefinitionTypes): ShapeDefinition {
        let shapeDefinition: ShapeDefinition = {
            type: type ? type : ShapeDefinitionTypes.Drawing,
            title: { isMultilingualString: true },
            id: Guid.newGuid()
        } as ShapeDefinition

        if (shapeDefinition.type == ShapeDefinitionTypes.Drawing) {
            (shapeDefinition as DrawingShapeDefinition).shapeTemplate = ShapeTemplatesConstants.Diamond;
            shapeDefinition.title = ShapeTemplatesConstants.Diamond.title;
            (shapeDefinition as DrawingShapeDefinition).fontSize = 20;
            (shapeDefinition as DrawingShapeDefinition).backgroundColor = theming.promoted.header.background.base;
            (shapeDefinition as DrawingShapeDefinition).textColor = theming.promoted.header.text.base;
            (shapeDefinition as DrawingShapeDefinition).width = 100;
            (shapeDefinition as DrawingShapeDefinition).height = 100;
            (shapeDefinition as DrawingShapeDefinition).textPosition = 2;
        }

        return shapeDefinition;
    }
}