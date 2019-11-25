import { SpacingSetting, MultilingualString } from '@omnia/fx-models';
import { ProcessLibraryViewSettings } from './ProcessLibraryViewSettings';

export interface ProcessLibrarySettings {
    title: MultilingualString;
    viewSettings: ProcessLibraryViewSettings;
    spacing?: SpacingSetting
}
