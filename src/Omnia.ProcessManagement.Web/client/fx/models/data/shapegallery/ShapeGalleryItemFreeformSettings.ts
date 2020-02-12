import { ShapeGalleryItemSettings } from './ShapeGalleryItemSettings';
import { IFabricShape } from '../../../processshape/fabricshape/IFabricShape';

export interface ShapeGalleryItemFreeformSettings extends ShapeGalleryItemSettings {
    nodes: IFabricShape[];
}