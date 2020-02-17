export module OPMCoreLocalization {
    export const namespace = "OPM.Core";
    export interface locInterface {
        Common: {
            SearchBoxPlaceholder: string
        },
        Features: {
            ArchiveProcess: {
                Category: string,
                Description: string,
                Title: string
            },
            ProcessLibrary: {
                Category: string,
                Description: string,
                Title: string
            },
            ProcessManagement: {
                Category: string,
                Description: string,
                Title: string
            },
            Lists: {
                OPMTasks: {
                    Name: string,
                    Description: string
                },
                OPMPublished: {
                    Name: string,
                    Description: string
                },
                OPMArchived: {
                    Name: string,
                    Description: string
                }
            },
            ContentTypes: {
                GroupName: string,
                OPMReviewTask: {
                    Name: string,
                    Description: string
                },
                OPMApprovalTask: {
                    Name: string,
                    Description: string
                },
                OPMReviewReminderTask: {
                    Name: string,
                    Description: string
                }
            },
            SharePointGroups: {
                AuthorGroupSuffix: string,
                ReaderGroupSuffix: string
            },
            Fields: {
                GroupName: string,
                OPMProcessId: {
                    Name: string,
                    Description: string,
                },
                OPMEdition: {
                    Name: string,
                    Description: string,
                },
                OPMRevision: {
                    Name: string,
                    Description: string,
                },
                OPMProcessData: {
                    Name: string,
                    Description: string,
                },
                OPMTaskOutcome: {
                    Name: string,
                    Description: string,
                },
                OPMComment: {
                    Name: string,
                    Description: string,
                }
            }
        },
        Blocks: {
            ProcessLibrary: {
                Title: string,
                Description: string
            },
            BlockProcessRenderer: {
                Title: string,
                Description: string
            },
            Content: {
                Title: string,
                Description: string
            },
            Drawing: {
                Title: string,
                Description: string
            },
            ProcessInformation: {
                Title: string
            },
            Tasks: {
                Title: string,
                Description: string
            },
            Links: {
                Title: string,
                Description: string
            },
            ProcessNavigation: {
                Title: string,
                Description: string
            },
            ProcessRollup: {
                Title: string,
                Description: string
            },
            Properties: {
                Title: string,
                Description: string
            },
            Title: {
                Title: string,
                Description: string
            }
        },
        BlockCategories: {
            Process: string
        },
        Columns: {
            ProcessMenu: string,
            Title: string,
            Status: string,
            DueDate: string,
            Approver: string,
            Name: string,
            Email: string,
            AssignedTo: string,
            CreatedBy: string,
            Comment: string,
            Edition: string,
            Revision: string,
            Published: string,
            ApprovedBy: string,
            WorkflowHistory: string
        },
        Process: {
            Drawing: string,
            Content: string,
            Documents: string,
            Links: string,
            Tasks: string,
            Properties: string
        },
        Shape: string,
        DrawingShapeSettings: {
            TextColor: string,
            HoverBackgroundColor: string,
            HoverBorderColor: string,
            HoverTextColor: string,
            SelectedBackgroundColor: string,
            SelectedBorderColor: string,
            SelectedTextColor: string,
            Width: string,
            Height: string,
            TextPosition: string,
            TextAlignment: string,
            TextAdjustment: string,
            FontSize: string,
            Above: string,
            On: string,
            Below: string,
            Left: string,
            Center: string,
            Right: string
        },
        Buttons: {
            DiscardChanges: string,
            Design: string,
            Preview: string,
            SaveAsDraft: string,
            DrawShape: string,
            RedrawShape: string,
            AddImage: string,
            EditImage: string,
            DrawFreeform: string
        },
        ShapeNames: {
            Freeform: string,
            Media: string
        },
        Messages: {
            TaskCompleted: string,
            AuthorPermissionIsRequried: string,
            MessageReviewReminderTaskEditingDescription: string,
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
            MessageDraftExistCannotBeArchived: string,
            SyncToSharePointFailed: string,
            ArchiveProcessFailed: string
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
            RetrySyncToSharePoint: string,
            Archive: string,
            NewProcess: string,
            SetNewReviewDate: string,
            Unpublish: string,
            CloseTask: string
        }
    }
}