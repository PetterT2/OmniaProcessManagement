import { MultilingualString, SpacingSettings } from '@omnia/fx-models';
import { ProcessPropertySetting } from './PropertiesBlockDataData';

export interface PropertiesBlockSettings {
    title: MultilingualString;
    spacing?: SpacingSettings;
    properties: Array<ProcessPropertySetting>;
}