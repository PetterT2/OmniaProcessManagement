export module ProcessLibraryLocalization {
    export const namespace = "OPM.ProcessLibrary";
    export interface locInterface {
        Common: {
            NoDraftItemToShow: string,
            Yes: string,
            No: string,
            Send: string
        },
        ProcessStatuses: {
            Draft: string,
            Published: string,
            SendingForApproval: string,
            WaitingForApproval: string,
            Publishing: string,
            CancellingApproval: string,
            FailedSendingForApproval: string,
            FailedCancellingApproval: string,
            FailedPublishing: string
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
            PreviewProcess: string
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
            DeleteDraftProcessConfirmation: string,
            NoProcessTemplateValidation: string,
            MessageNobodyCanApprove: string,
            MessageUpdateProcessPropertiesBeforePublishing: string,
            MessageNoItem: string
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
        EmailTemplates: {
            SendForApproval: {
                TaskTitle: string,
                EmailSubjectTemplate: string,
                EmailBodyTemplate: string,
                ApprovalEditionCommentTemplate: string,
                SubjectApproval: string,
                BodyApproval: string,
                BodyApprovalNoComment: string,
                SubjectReject: string,
                BodyReject: string,
                CancelSubjectTemplate: string,
                CancelBodyTemplate: string
            }
        }
    }
}