export module ProcessLibraryLocalization {
    export const namespace = "OPM.ProcessLibrary";
    export interface locInterface {
        Common: {
            Yes: string,
            No: string,
            Send: string
        },
        ProcessNoItem: {
            Draft: string,
            LatestPublished: string
        },
        ProcessStatuses: {
            SendingForReview: string,
            SendingForReviewFailed: string,
            SentForReview: string,
            CancellingReview: string,
            CancellingReviewFailed: string,

            SendingForApproval: string,
            SendingForApprovalFailed: string,
            SentForApproval: string,
            CancellingApproval: string,
            CancellingApprovalFailed: string,

            SyncingToSharePoint: string
            SyncingToSharePointFailed: string
        },
        TaskStatus: {
            Cancel: string,
            Completed: string,
            NotStarted: string
        },
        TaskViews: {
            TasksAssignedToMe: string,
            CompletedTasks: string,
            TasksAssignedByMe: string,
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
            DeleteDraft: string,
            PreviewProcess: string,
            CreateDraft: string,
            ViewProcess: string,
            ExportProcess: string,
            ProcessHistory: string,
            MoveProcess: string,
            UnpublishProcess: string,
            SyncToSharePoint: string,
            RetrySyncToSharePoint: string
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
        Messages: {
            DeletePublishedProcessConfirmation: string,
            ArchivePublishedProcessConfirmation: string,
            DeleteDraftProcessConfirmation: string,
            NoProcessTemplateValidation: string,
            MessageNobodyCanApprove: string,
            MessageUpdateProcessPropertiesBeforePublishing: string,
            MessageNoItem: string,
            MessageApprovalTaskEditingCompletedTask: string,
            MessageApprovalTaskEditingCompletedTaskNoComment: string,
            MessageRequireRejectComment: string,
            MessageTaskHasBeenCompletedOrCanceled: string,
            MessageTaskCancelledBySystem: string,
            MessageApprovalTaskEditingDescription: string,
            SyncToSharePointFailed: string

        },
        ProcessType: string,
        ProcessTemplate: string,
        Approval: {
            Approved: string,
            Rejected: string,
            CancelApproval: string,
            MessageCancelApproval: string,
            VersionPublishingTypes: {
                PublishNewEdition: string,
                PublishNewRevision: string
            },
            BeSureToPublishProcess: string,
            Approver: string,
            ApprovalDueDate: string,
            Comment: string,
        },
        ReadRights: {
            Label: string,
            DefaultReaders: string,
            LimitReadAccess: string
        },
        EmailTemplates: {
            SendForApproval: {
                SubjectTemplate: string,
                BodyTemplate: string,
                AuthorEditionCommentTemplate: string
            },
            CancelApproval: {
                SubjectTemplate: string,
                BodyTemplate: string
            },
            CompleteApproval: {
                ApproveSubjectTemplate: string,
                ApproveBodyTemplate: string,
                ApproveBodyNoCommentTemplate: string,
                RejectSubjectTemplate: string,
                RejectBodyTemplate: string
            }
        },
        TaskTitle: {
            ApprovalTaskPrefix: string
        }
    }
}