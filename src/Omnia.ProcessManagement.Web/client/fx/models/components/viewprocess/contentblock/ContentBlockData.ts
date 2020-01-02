import { BlockDataWithSettingsAndData } from '@omnia/wcm/models';
import { ContentBlockDataData } from './ContentBlockDataData';
import { ContentBlockSettings } from './ContentBlockSettings';

export interface ContentBlockData extends BlockDataWithSettingsAndData<ContentBlockDataData, ContentBlockSettings> {
}