import { BlockDataWithSettingsAndData } from '@omnia/wcm/models';
import { PropertiesBlockDataData } from './PropertiesBlockDataData';
import { PropertiesBlockSettings } from './PropertiesBlockSettings';

export interface PropertiesBlockData extends BlockDataWithSettingsAndData<PropertiesBlockDataData, PropertiesBlockSettings> {
}