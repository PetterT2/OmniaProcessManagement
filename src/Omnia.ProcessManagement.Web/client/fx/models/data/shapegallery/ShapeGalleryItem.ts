﻿import { GuidValue, Guid } from '@omnia/fx-models';
import { ShapeGalleryItemSettings } from './ShapeGalleryItemSettings';
import { OmniaTheming } from '@omnia/fx/ux';
import { TextPosition, TextAlignment } from '../enums/Enums';
import { ShapeTemplatesConstants } from '../../../constants';
import { DrawingShapeDefinition, ShapeDefinitionTypes, ShapeDefinition } from '../shapedefinitions';

export interface ShapeGalleryItem {
    id: GuidValue,
    settings: ShapeGalleryItemSettings,
    builtIn: boolean,

    //client-side
    multilingualTitle: string
}

/**
 * NOTE: whenever an new property is added in settings, we need to define its initial value in factory
 * To ensure it fully react on view
 * */
export const ShapeGalleryItemFactory = {
    createDefaultShapeGalleryItem(theming: OmniaTheming): ShapeGalleryItem {
        let shapeGalleryItem: ShapeGalleryItem = {
            id: Guid.newGuid(),
            settings: {
                shapeDefinition: {
                    type: ShapeDefinitionTypes.Drawing,
                    title: { isMultilingualString: true },
                    id: Guid.newGuid(),
                    shapeTemplate: ShapeTemplatesConstants.Freeform,
                    fontSize: 20,
                    backgroundColor: theming.promoted.header.background.base,
                    textColor: theming.promoted.header.text.base,
                    textPosition: TextPosition.On,
                    textAlignment: TextAlignment.Center,
                    textHorizontalAdjustment: 0,
                    textVerticalAdjustment: 0,
                    width: 200,
                    height: 200
                }
            },
            builtIn: false
        } as ShapeGalleryItem

        return shapeGalleryItem;
    }
}