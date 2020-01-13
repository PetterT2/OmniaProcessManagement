import { MultilingualString, SpacingSetting } from '@omnia/fx-models';

export interface ProcessNavigationBlockSettings {
    title: MultilingualString;
    spacing?: SpacingSetting;
    levelIndentation: number;
}