import { Enums, ProcessRollupBlockData, ProcessRollupBlockSettings,  } from '../../fx/models';
import { BuiltInEnterprisePropertyInternalNames } from '@omnia/fx-models';

/**
 * Factory for Process Rollup settings
 * */
export const ProcessRollupConfigurationFactory = {
    create(): ProcessRollupBlockData {
        let newSettings: ProcessRollupBlockData = {
            data: {},
            settings: {
                resources: [],
                itemLimit: 10,
                title: null,
                viewSettings: { selectProperties: [] },
                orderBy: [{ propertyName: '', descending: true }],
                filters: [],
                pagingType: Enums.ProcessViewEnums.PagingType.NoPaging,
                displayFields: []
            } as ProcessRollupBlockSettings
        };

        return newSettings;
    }
}

