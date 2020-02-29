import { EnterprisePropertyDefinition, SpacingSettings } from '@omnia/fx-models';
import { ProcessRollupViewSettings, RollupProcess } from '../../fx/models';


export interface IProcessRollupViewInterface<T extends ProcessRollupViewSettings> {
    viewPageUrl: string;
    processes: Array<RollupProcess>;
    viewSettings: T;
    SpacingSettings?: SpacingSettings;
    sortByCallback?: (sortKey: string, descending: boolean) => void;
}

export interface IProcessRollupViewSettingsInterface<T extends ProcessRollupViewSettings> {
    viewSettings: T;
    availableProperties: Array<EnterprisePropertyDefinition>;
    onUpdatedViewSettings: (viewSettings: T) => void;
}
