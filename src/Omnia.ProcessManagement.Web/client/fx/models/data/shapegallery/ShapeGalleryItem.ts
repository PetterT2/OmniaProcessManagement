import { GuidValue } from '@omnia/fx-models';
import { ShapeGalleryItemSettings, ShapeGalleryItemType } from './ShapeGalleryItemSettings';
import { OmniaTheming } from '@omnia/fx/ux';
import { TextPosition, TextAlignment } from '../enums/Enums';
import { ShapeTemplatesConstants } from '../../../constants';

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
            settings: {
                shapeDefinition: {
                    shapeTemplate: ShapeTemplatesConstants.Freeform,
                    fontSize: 20,
                    backgroundColor: theming.promoted.header.background.base,
                    textColor: theming.promoted.header.text.base,
                    textPosition: TextPosition.On,
                    textAlignment: TextAlignment.Center,
                    textHorizontalAdjustment: 0,
                    textVerticalAdjustment: 0,
                }
            },
            builtIn: false
        } as ShapeGalleryItem

        return shapeGalleryItem;
    }
}