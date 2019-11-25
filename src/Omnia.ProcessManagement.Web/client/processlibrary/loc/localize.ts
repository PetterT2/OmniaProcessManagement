export module ProcessLibraryLocalization {
    export const namespace = "OPM.ProcessLibrary";
    export interface locInterface {
        Common: {
            NoDraftItemToShow: string,
        },
        Filter: {
            FilterBy: string,
            ClearFilter: string,
            ClearAll: string,
            ApplyFilter: string
        },
        ViewTabs: {
            Drafts: string,
            Tasks: string,
            Published: string
        },
        Buttons: {
            NewProcess: string
        },
        ProcessActions: {
            Edit: string,
            Preview: string,
            SendForComments: string,
            Publish: string,
            WorkflowHistory: string,
            DeleteDraft: string
        },
        SortText: {
            TextFieldAscending: string,
            TextFieldDescending: string,
            NumberFieldAscending: string,
            NumberFieldDescending: string,
            BooleanFieldAscending: string,
            BooeleanFieldDescending: string,
            DateFieldAscending: string,
            DateFieldDescending: string
        }
    }
}