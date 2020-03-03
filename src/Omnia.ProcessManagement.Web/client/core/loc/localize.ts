export module OPMCoreLocalization {
    export const namespace = "OPM.Core";
    export interface locInterface {
        EnterprisePropertyDataType: {
            Process: {
                Title: string
            }
        },
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
                OPMProcessIdNumber: {
                    Name: string,
                    Description: string
                },
                OPMIsArchived: {
                    Name: string,
                    Description: string
                },
                OPMEdition: {
                    Name: string,
                    Description: string,
                },
                OPMRevision: {
                    Name: string,
                    Description: string,
                },
                OPMReviewDate: {
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
        BlockDefinitions: {
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
            },
            Breadcrumb: {
                Title: string,
                Description: string
            },
            Documents: {
                Title: string,
                Description: string
            }
        },
        Blocks: {
            Drawing: {

            },
            Content: {

            },
            Links: {

            },
            Navigation: {
                StartLevel: string,
                GetParentSiblings: string,
                LevelIndentation: string
            },
            Properties: {
                SelectProperties: string,
                SelectPropertySet: string,
                ShowLabel: string,
                DateFormatMode: string,
                Format: string,
                FormatModeDefault: string,
                FormatModeNormal: string,
                FormatModeSocial: string,
                Properties: {
                    Published: string,
                    LinkToProcessLibrary: string
                }
            },
            Tasks: {

            },
            Title: {
                Formatting: string,
                FormatingOptions: {
                    Normal: string,
                    Heading1: string,
                    Heading2: string,
                    Heading3: string
                }
            }
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
            ModifiedAt: string,
            ModifiedBy: string,
            ApprovedBy: string,
            WorkflowHistory: string
        },
        Process: {
            Drawing: string,
            Content: string,
            Documents: string,
            Links: string,
            Tasks: string,
            Properties: string,
            LinkedProcess: string
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
            ShowMoreSettings: string,
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
            CheckIn: string,
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
            MessageDraftExist: string,
            SyncToSharePointFailed: string,
            ArchiveProcessFailed: string,
            ShapeTemplateHasBeenDeleted: string,
            UnauthorizedOrProcessNotFound: string,
            TakeControlConfirmation: string
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
            CloseTask: string,
            TakeControl: string
        },
        SearchTemplates: {
            ProcessSearchTemplate: {
                Preview: string,
                ClosePreview: string
            }
        }
    }
}