import { BlockDataWithSettingsAndData } from '@omnia/wcm/models';
import { DrawingBlockDataData } from './DrawingBlockDataData';
import { DrawingBlockSettings } from './DrawingBlockSettings';

export interface DrawingBlockData extends BlockDataWithSettingsAndData<DrawingBlockDataData, DrawingBlockSettings> {
}