import { ProcessRollupViewSettings, ProcessRollupFilter } from '..';
import { Enums } from '../..';
import { SpacingSetting, MultilingualString, RollupSetting } from '@omnia/fx-models';

export interface ProcessRollupBlockSettings extends RollupSetting {
    title: MultilingualString;
    pagingType: Enums.ProcessViewEnums.PagingType;
    selectedViewId: string;
    viewSettings: ProcessRollupViewSettings;
    uiFilters?: Array<ProcessRollupFilter>;
    spacing?: SpacingSetting;
    searchScope: Enums.ProcessViewEnums.QueryScope;
}