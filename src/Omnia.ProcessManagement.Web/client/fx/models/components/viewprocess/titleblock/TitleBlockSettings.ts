import { MultilingualString } from '@omnia/fx-models';
import { Enums } from '../../../Enums';

export interface TitleBlockSettings {
    title: MultilingualString;
    formatting: Enums.ProcessViewEnums.HeadingFormatting;
}