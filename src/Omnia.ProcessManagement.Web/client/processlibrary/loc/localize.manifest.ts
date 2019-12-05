import { Composer } from '@omnia/tooling/composers';
import { ProcessLibraryLocalization } from "./localize";

Composer.registerManifest("64102160-1db4-44f8-a1a7-18f9a7b5a4a3")
    .registerLocalization()
    .namespace(ProcessLibraryLocalization.namespace)
    .add<ProcessLibraryLocalization.locInterface>({
        Common: {
            NoDraftItemToShow: "There are no draft processes to show",
            Yes: "Yes",
            No: "No"
        },
        ProcessLibrarySettings: {
            Tabs: {
                General: "General",
                Display: "Display",
                Drafts: "Drafts",
                Published: "Published"
            },
            Title: "Title",
            DefaultTab: "Default tab",
            HideTasksTab: "Hide Tasks Tab",
            DisplayColumnsInPublishedView: "Display columns in published view",
            DisplayColumnsInDraftView: "Display columns in draft view",
            DefaultOrderingField: "Default Ordering Field",
            Column: "Column",
            ShowSearchBox: "Show Search Box",
            PageSize: "Page Size",
            Paging: "Paging"
        },
        Filter: {
            FilterBy: "Filter by",
            ClearFilter: "Clear filters",
            ClearAll: "Clear all",
            ApplyFilter: "Apply filter",
            Empty: "Empty"
        },
        PagingType: {
            NoPaging: "No Paging",
            Classic: "Classic"
        },
        ViewTabs: {
            Drafts: "Drafts",
            Tasks: "Tasks",
            Published: "Published"
        },
        Buttons: {
            NewProcess: "New Process"
        },
        ProcessActions: {
            Edit: "Edit",
            Preview: "Preview",
            SendForComments: "Send for Comments",
            Publish: "Publish",
            WorkflowHistory: "Workflow History",
            DeleteDraft: "Delete Draft",
        },
        SortText: {
            Direction: "Sort Direction",
            Ascending: "Ascending",
            Descending: "Descending",
            TextFieldAscending: "A to Z",
            TextFieldDescending: "Z to A",
            NumberFieldAscending: "Smaller to larger",
            NumberFieldDescending: "Larger to smaller",
            BooleanFieldAscending: "No to Yes",
            BooeleanFieldDescending: "Yes to No",
            DateFieldAscending: "Older to newer",
            DateFieldDescending: "Newer to older"
        },
        Message: {
            DeleteDraftProcessConfirmation: "Are you sure you want to delete the selected process?",
            NoProcessTemplateValidation: "This process is not based on any existing process template."
        },
        ProcessType: "Process Type",
        ProcessTemplate: "Process Template"
    });