import { Enums, ProcessLibraryBlockData } from '../../fx/models';
import { LibrarySystemFieldsConstants } from '../Constants';

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
                    draftTabDisplaySettings: {
                        pagingType: Enums.ProcessViewEnums.PagingType.NoPaging,
                        itemLimit: 0,
                        orderDirection: Enums.ProcessViewEnums.OrderDirection.Descending,
                        defaultOrderingFieldName: LibrarySystemFieldsConstants.Title,
                        selectedFields: ProcessLibraryConfigurationFactory.getDefaultDraftDisplayFields(),
                        showSearchBox: true
                    },
                    publishedTabDisplaySettings: {
                        pagingType: Enums.ProcessViewEnums.PagingType.Classic,
                        itemLimit: 30,
                        orderDirection: Enums.ProcessViewEnums.OrderDirection.Descending,
                        defaultOrderingFieldName: "",
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

        ]
    },
    getDefaultDraftDisplayFields() {
        return [
            LibrarySystemFieldsConstants.Title,
            LibrarySystemFieldsConstants.Menu
        ]
    }
}

