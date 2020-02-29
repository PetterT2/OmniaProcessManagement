import { Enums, ProcessLibraryBlockData } from '../../fx/models';
import { LibrarySystemFieldsConstants, ProcessLibraryFields } from '../Constants';

export const ProcessLibraryConfigurationFactory = {
    create(): ProcessLibraryBlockData {
        let newSettings: ProcessLibraryBlockData = {
            data: {},
            settings: {
                title: '',
                viewSettings: {
                    defaultTab: Enums.ProcessViewEnums.StartPageTab.Drafts,
                    hideTasksTab: false,
                    defaultDocumentTypes: [],
                    publishedTabDisplaySettings: {
                        pagingType: Enums.ProcessViewEnums.PagingType.NoPaging,
                        pageSize: 0,
                        orderDirection: Enums.ProcessViewEnums.OrderDirection.Descending,
                        defaultOrderingFieldName: ProcessLibraryFields.PublishedAt,
                        selectedFields: ProcessLibraryConfigurationFactory.getDefaultPublishedDisplayFields(),
                        showSearchBox: true
                    },
                }
            } as any
        };

        return newSettings;
    },
    getDefaultPublishedDisplayFields() {
        return [
            LibrarySystemFieldsConstants.Title,
            LibrarySystemFieldsConstants.Menu,
            ProcessLibraryFields.Edition,
            ProcessLibraryFields.Revision,
            ProcessLibraryFields.PublishedAt,
            LibrarySystemFieldsConstants.Status
        ]
    },
    getDraftTabDisplaySettings: {
        pagingType: Enums.ProcessViewEnums.PagingType.Classic,
        pageSize: 50,
        orderDirection: Enums.ProcessViewEnums.OrderDirection.Descending,
        defaultOrderingFieldName: ProcessLibraryFields.ModifiedAt,
        selectedFields: [
            LibrarySystemFieldsConstants.Title,
            LibrarySystemFieldsConstants.Menu,
            LibrarySystemFieldsConstants.Status,
            ProcessLibraryFields.ModifiedAt,
            ProcessLibraryFields.ModifiedBy
        ]
    }
}

