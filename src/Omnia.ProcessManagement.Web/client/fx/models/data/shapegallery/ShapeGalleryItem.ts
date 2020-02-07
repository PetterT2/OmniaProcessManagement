import { GuidValue } from '@omnia/fx-models';
import { ShapeGalleryItemSettings, ShapeGalleryItemType } from './ShapeGalleryItemSettings';

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
    createDefaultShapeGalleryItem(): ShapeGalleryItem {
        let shapeGalleryItem: ShapeGalleryItem = {
            settings: {
                type: ShapeGalleryItemType.Freeform,
                shapeDefinition: {}
            },
            builtIn: false
        } as ShapeGalleryItem

        return shapeGalleryItem;
    }
}