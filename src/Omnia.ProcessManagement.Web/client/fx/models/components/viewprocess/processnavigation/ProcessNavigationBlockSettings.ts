import { MultilingualString, SpacingSettings } from '@omnia/fx-models';

export interface ProcessNavigationBlockSettings {
    title: MultilingualString;
    spacing?: SpacingSettings;
    levelIndentation: number;
}