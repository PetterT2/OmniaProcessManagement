export module ProcessLibraryLocalization {
    export const namespace = "OPM.ProcessLibrary";
    export interface locInterface {
        Common: {
            NoDraftItemToShow: string,
            Yes: string,
            No: string
        },
        ProcessLibrarySettings: {
            Tabs: {
                General: string,
                Display: string,
                Drafts: string,
                Published: string
            },
            Title: string,
            DefaultTab: string,
            HideTasksTab: string,
            DisplayColumnsInPublishedView: string,
            DisplayColumnsInDraftView: string,
            DefaultOrderingField: string,
            Column: string,
            ShowSearchBox: string,
            PageSize: string,
            Paging: string
        },
        Filter: {
            FilterBy: string,
            ClearFilter: string,
            ClearAll: string,
            ApplyFilter: string,
            Empty: string
        },
        PagingType: {
            NoPaging: string,
            Classic: string
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
            Direction: string,
            Ascending: string,
            Descending: string,
            TextFieldAscending: string,
            TextFieldDescending: string,
            NumberFieldAscending: string,
            NumberFieldDescending: string,
            BooleanFieldAscending: string,
            BooeleanFieldDescending: string,
            DateFieldAscending: string,
            DateFieldDescending: string
        },
        Message: {
            DeleteDraftProcessConfirmation: string,
            NoProcessTemplateValidation: string
        },
        ProcessType: string,
        ProcessTemplate: string
    }
}