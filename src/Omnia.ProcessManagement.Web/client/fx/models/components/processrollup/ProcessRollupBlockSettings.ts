import { ProcessRollupViewSettings, ProcessRollupFilter } from '..';
import { Enums } from '../..';
import { SpacingSetting, MultilingualString, RollupSetting } from '@omnia/fx-models';

export interface ProcessRollupBlockSettings extends RollupSetting {
    title: MultilingualString;
    pagingType: Enums.ProcessViewEnums.PagingType;
    query: string;
    selectedViewId: string;
    viewSettings: ProcessRollupViewSettings;
    filters?: Array<ProcessRollupFilter>;
    spacing?: SpacingSetting;
}