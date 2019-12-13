import { Composer } from '@omnia/tooling/composers';
import { ProcessLibraryLocalization } from "./localize";

Composer.registerManifest("64102160-1db4-44f8-a1a7-18f9a7b5a4a3")
    .registerLocalization()
    .namespace(ProcessLibraryLocalization.namespace)
    .add<ProcessLibraryLocalization.locInterface>({
        Common: {
            NoDraftItemToShow: "There are no draft processes to show",
            Yes: "Yes",
            No: "No",
            Send: "Send"
        },
        ProcessStatuses: {
            Draft: "Draft",
            Published: "Published",
            SendingForApproval: "Sending for Approval",
            WaitingForApproval: "Waiting for Approval",
            Publishing: "Publishing",
            CancellingApproval: "Cancelling Approval",
            FailedSendingForApproval: "Sending for Approval failed",
            FailedCancellingApproval: "Cancelling Send for Approval failed",
            FailedPublishing: "Publishing failed"
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
            PreviewProcess: "Preview"
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
        Messages: {
            DeleteDraftProcessConfirmation: "Are you sure you want to delete the selected process?",
            NoProcessTemplateValidation: "This process is not based on any existing process template.",
            MessageNobodyCanApprove: "There are no available approver for this process.",
            MessageUpdateProcessPropertiesBeforePublishing: "You need to fill in all required properties to be able to publish a process.",

        },
        ProcessType: "Process Type",
        ProcessTemplate: "Process Template",
        Approval: {
            Approved: "Approved",
            Rejected: "Rejected",
            CancelApproval: "Cancel Approval Workflow",
            MessageCancelApproval: "Are you sure you want to cancel this workflow?",
            VersionPublishingTypes: {
                PublishNewEdition: "Publish New Edition",
                PublishNewRevision: "Publish New Revision"
            },
            BeSureToPublishProcess: "Are you sure you want to publish this process?",
            Approver: "Approver",
            ApprovalDueDate: "Approval Due Date",
            Comment: "Comment",
        },
        EmailTemplates: {
            SendForApproval: {
                TaskTitle: "Approval of process: {0}",
                EmailSubjectTemplate: "Approve or reject the publishing of the process {{Name}}",
                EmailBodyTemplate: "Dear {{Approver}}, <br/><br/>You have been assigned to a task by {{Author}} to approve or reject the publishing of the process {{Name}}, that is due {{DueDate}}<br/><br/>1. Open the process {{ProcessLink}}<br/> 2. Review the contents of the process.<br/>  3. Open the task {{TaskTitle}}.<br/>   4. Add a comment to the task and select Approve or Reject.<br/><br/>{{Author}} will be notified once your task has been completed.<br/><br/>",
                ApprovalEditionCommentTemplate: "{{Author}} {{StartDate}}:<br/> &quot;{{Message}}&quot;",
                SubjectApproval: "The process {{Name}} has been approved for publishing",
                BodyApproval: "Dear {{Author}},<br/><br/>The process {{Name}} has been approved for publishing by {{Approver}} with the following comment:<br/><br/> &quot;{{ApproverComment}}&quot;",
                BodyApprovalNoComment: "Dear {{Author}},<br/><br/>The process {{Name}} has been approved for publishing by {{Approver}}.",
                SubjectReject: "The process {{Name}} has been rejected for publishing",
                BodyReject: "Dear {{Author}},<br/><br/>The process {{Name}} has been rejected for publishing by {{Approver}} with the following comment:<br/><br/> &quot;{{ApproverComment}}&quot;",
                CancelSubjectTemplate: "Approval of the process {{Name}} cancelled",
                CancelBodyTemplate: "Dear {{Approver}}, <br/>The approval of the process {{Name}} has been cancelled."
            }
        }
    });