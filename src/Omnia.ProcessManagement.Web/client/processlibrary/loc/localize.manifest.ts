import { Composer } from '@omnia/tooling/composers';
import { ProcessLibraryLocalization } from "./localize";

Composer.registerManifest("64102160-1db4-44f8-a1a7-18f9a7b5a4a3")
    .registerLocalization()
    .namespace(ProcessLibraryLocalization.namespace)
    .add<ProcessLibraryLocalization.locInterface>({
        Common: {
            Yes: "Yes",
            No: "No",
            Send: "Send"
        },
        ProcessNoItem: {
            Draft: "There are no draft processes to show",
            LatestPublished: "There are no published processes to show"
        },
        ProcessStatuses: {
            SendingForApproval: "Sending for Approval",
            SentForApproval: "Waiting for Approval",
            SendingForApprovalFailed: "Sending for Approval failed",
            CancellingApproval: "Cancelling Approval",
            CancellingApprovalFailed: "Cancelling Send for Approval failed",

            SendingForReview: "Sending for Comments",
            SentForReview: "Sent for Comments",
            SendingForReviewFailed: "Sending for Comments failed",
            CancellingReview: "Cancelling Send for Comments",
            CancellingReviewFailed: "Cancelling Send for Comments failed",
            SyncingToSharePoint: "Syncing to SharePoint",
            SyncingToSharePointFailed: "Syncing To SharePoint failed"

        },
        TaskStatus: {
            Cancel: "Cancel",
            Completed: "Completed",
            NotStarted: "Not Started",
        },
        TaskViews: {
            TasksAssignedToMe: "Assigned To Me",
            CompletedTasks: "Completed Tasks",
            TasksAssignedByMe: "Assigned By Me",
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
            PreviewProcess: "Preview",
            CreateDraft: "Create Draft",
            ViewProcess: "View Process",
            ExportProcess: "Export Process",
            ProcessHistory: "Process History",
            MoveProcess: "Move Process",
            UnpublishProcess: "Unpublish Process",
            SyncToSharePoint: "Sync To SharePoint",
            RetrySyncToSharePoint: "Retry"
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
            DeletePublishedProcessConfirmation: "Are you sure you want to delete the process?",
            ArchivePublishedProcessConfirmation: "Are you sure you want to delete and archive the process?",
            DeleteDraftProcessConfirmation: "Are you sure you want to delete the selected process?",
            NoProcessTemplateValidation: "This process is not based on any existing process template.",
            MessageNobodyCanApprove: "There are no available approver for this process.",
            MessageUpdateProcessPropertiesBeforePublishing: "You need to fill in all required properties to be able to publish a process.",
            MessageNoItem: "There are no items to show in this view.",
            MessageApprovalTaskEditingCompletedTask: "This task has been completed by <strong>{{User}}</strong> with the following comment:",
            MessageApprovalTaskEditingCompletedTaskNoComment: "This task has been completed by <strong>{{User}}</strong>.",            
            MessageTaskHasBeenCompletedOrCanceled: "This task has been completed or canceled.",
            MessageRequireRejectComment: "You need to submit a comment when the process is rejected.",
            MessageTaskCancelledBySystem: "Task was cancelled by the system",
            MessageApprovalTaskEditingDescription: "Open the process and review the contents. When you are done, please write a comment in the text field below and select Approve or Reject",
            SyncToSharePointFailed: "This process was synced to SharePoint failed"

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
                SubjectTemplate: "Approve or reject the publishing of the process {{ProcessTitle}}",
                BodyTemplate: "Dear {{ApproverName}}, <br/><br/>You have been assigned to a task by {{AuthorName}} to approve or reject the publishing of the process {{ProcessTitle}}, that is due {{DueDate}}<br/><br/>1. Open the process <a href='{{ProcessLink}}' target='_blank'>{{ProcessTitle}}</a><br/> 2. Review the contents of the process.<br/>  3. Open the task <a href='{{TaskLink}}' target='_blank'>{{TaskTitle}}</a>.<br/>   4. Add a comment to the task and select Approve or Reject.<br/><br/>{{AuthorName}} will be notified once your task has been completed.<br/><br/>",
                AuthorEditionCommentTemplate: "{{AuthorName}} {{StartDate}}:<br/> &quot;{{Message}}&quot;",
            },
            CancelApproval: {
                SubjectTemplate: "Approval of the process {{ProcessTitle}} cancelled",
                BodyTemplate: "Dear {{ApproverName}}, <br/>The approval of the process {{ProcessTitle}} has been cancelled."
            },
            CompleteApproval: {
                ApproveSubjectTemplate: "The process {{ProcessTitle}} has been approved for publishing",
                ApproveBodyTemplate: "Dear {{AuthorName}},<br/><br/>The process {{ProcessTitle}} has been approved for publishing by {{ApproverName}} with the following comment:<br/><br/> &quot;{{ApproverComment}}&quot;",
                ApproveBodyNoCommentTemplate: "Dear {{AuthorName}},<br/><br/>The process {{ProcessTitle}} has been approved for publishing by {{ApproverName}}.",

                RejectSubjectTemplate: "The process {{ProcessTitle}} has been rejected for publishing",
                RejectBodyTemplate: "Dear {{AuthorName}},<br/><br/>The process {{ProcessTitle}} has been rejected for publishing by {{ApproverName}} with the following comment:<br/><br/> &quot;{{ApproverComment}}&quot;",
            }
        },
        TaskTitle: {
            ApprovalTaskPrefix: "Approval of process",
        }
    });