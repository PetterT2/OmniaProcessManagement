import { BlockDataWithSettingsAndData } from '@omnia/wcm/models';
import { TitleBlockDataData } from './TitleBlockDataData';
import { TitleBlockSettings } from './TitleBlockSettings';

export interface TitleBlockData extends BlockDataWithSettingsAndData<TitleBlockDataData, TitleBlockSettings> {
}