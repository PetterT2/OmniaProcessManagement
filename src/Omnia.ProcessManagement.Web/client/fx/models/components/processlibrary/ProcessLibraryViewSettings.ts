import { GuidValue } from '@omnia/fx-models';
import { Enums } from '../..';
import { ProcessLibraryDisplaySettings } from './ProcessLibraryDisplaySettings';

export interface ProcessLibraryViewSettings {
    defaultTab: Enums.ProcessViewEnums.StartPageTab,
    hideTasksTab: boolean,
    previewPageUrl: string,
    draftTabDisplaySettings: ProcessLibraryDisplaySettings,
    publishedTabDisplaySettings: ProcessLibraryDisplaySettings
}
