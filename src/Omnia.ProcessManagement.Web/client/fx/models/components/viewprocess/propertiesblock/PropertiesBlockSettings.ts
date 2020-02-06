import { MultilingualString, SpacingSetting } from '@omnia/fx-models';
import { ProcessPropertySetting } from './PropertiesBlockDataData';

export interface PropertiesBlockSettings {
    title: MultilingualString;
    spacing?: SpacingSetting;
    properties: Array<ProcessPropertySetting>;
}