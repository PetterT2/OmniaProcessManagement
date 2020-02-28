import { Composer } from '@omnia/tooling/composers';
import { OPMCoreLocalization } from "./localize";

Composer.registerManifest("523a6f8b-8ac0-4e3d-ac05-aa0b535636dd")
    .registerLocalization()
    .namespace(OPMCoreLocalization.namespace)
    .add<OPMCoreLocalization.locInterface>({
        EnterprisePropertyDataType: {
            Process: {
                Title: "Process"
            }
        },
        Common: {
            SearchBoxPlaceholder: "Search"
        },
        Features: {
            ArchiveProcess: {
                Category: "Process Management",
                Description: "Creates a library to manage archived processes in the site.",
                Title: "Process Archive"
            },
            ProcessLibrary: {
                Category: "Process Management",
                Description: "Creates a library to manage process in the site.",
                Title: "Process Library"
            },
            ProcessManagement: {
                Category: "Tenant",
                Description: "",
                Title: "Process Management"
            },
            Lists: {
                OPMTasks: {
                    Name: "Process Management - Tasks",
                    Description: "System library created by Omnia to handle workflow tasks of process"
                },
                OPMPublished: {
                    Name: "Process Management - Published",
                    Description: "System library created by Omnia to handle published of process"
                },
                OPMArchived: {
                    Name: "Process Management - Archived",
                    Description: "System library created by Omnia to handle archived process"
                }
            },
            ContentTypes: {
                GroupName: "Omnia Process Management",
                OPMReviewTask: {
                    Name: "Process - Review Task",
                    Description: "System content type created by Omnia to handle review tasks of process"
                },
                OPMApprovalTask: {
                    Name: "Process - Approval Task",
                    Description: "System content type created by Omnia to handle approval tasks of process"
                },
                OPMReviewReminderTask: {
                    Name: "Process - Review Reminder Task",
                    Description: "System content type created by Omnia to handle review reminder tasks of process"
                }
            },
            SharePointGroups: {
                AuthorGroupSuffix: "Process Authors",
                ReaderGroupSuffix: "Process Readers"
            },
            Fields: {
                GroupName: "Omnia Process Management",
                OPMProcessId: {
                    Name: "Process Id",
                    Description: "System column in Omnia Process Management for Process Id.",
                },
                OPMProcessIdNumber: {
                    Name: "Process Id Number",
                    Description: "System column in Omnia Process Management for Process Id Number.",
                },
                OPMIsArchived: {
                    Name: "Is Archived",
                    Description: "System column in Omnia Process Management for information about if a process is archived.",
                },
                OPMEdition: {
                    Name: "Edition",
                    Description: "System column in Omnia Process Management for Edition.",
                },
                OPMRevision: {
                    Name: "Revision",
                    Description: "System column in Omnia Process Management for Revision.",
                },
                OPMReviewDate: {
                    Name: "Review Date",
                    Description: "System column in Omnia Process Management for Review Date.",
                },
                OPMProcessData: {
                    Name: "Process Data",
                    Description: "System column in Omnia Process Management for Process Data.",
                },
                OPMTaskOutcome: {
                    Name: "TaskOutcome",
                    Description: "System column in Omnia Process Management for TaskOutcome.",
                },
                OPMComment: {
                    Name: "Comment",
                    Description: "System column in Omnia Process Management for Comment.",
                }
            }
        },
        BlockDefinitions: {
            ProcessLibrary: {
                Title: "Processes",
                Description: "Add this to a site where you want to work with processes."
            },
            BlockProcessRenderer: {
                Title: "Process Renderer",
                Description: ""
            },
            Content: {
                Title: "Process Content",
                Description: ""
            },
            Drawing: {
                Title: "Process Drawing",
                Description: ""
            },
            ProcessInformation: {
                Title: "Process Information"
            },
            Tasks: {
                Title: "Process Tasks",
                Description: ""
            },
            Links: {
                Title: "Process Links",
                Description: ""
            },
            ProcessNavigation: {
                Title: "Process Navigation",
                Description: ""
            },
            ProcessRollup: {
                Title: "Process Rollup",
                Description: "Use this block to roll up processes with filter possibilities on the result."
            },
            Properties: {
                Title: "Process Properties",
                Description: ""
            },
            Title: {
                Title: "Process Title",
                Description: ""
            },
            Breadcrumb: {
                Title: "Process Breadcrumb",
                Description: ""
            },
            Documents: {
                Title: "Process Documents",
                Description: ""
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
                StartLevel: "Start Level",
                GetParentSiblings: "Show Parent Siblings",
                LevelIndentation: "Level Indentation",
            },
            Properties: {
                SelectProperties: "Select properties",
                SelectPropertySet: "Select property set",
                ShowLabel: "Show label",
                DateFormatMode: "Date Type",
                Format: "Format",
                FormatModeDefault: "Default",
                FormatModeNormal: "Classic",
                FormatModeSocial: "Social",
                Properties: {
                    Published: "Published",
                    LinkToProcessLibrary: "Link to Process Library"
                }
            },
            Tasks: {

            },
            Title: {
                Formatting: "Formatting",
                FormatingOptions: {
                    Normal: "Normal",
                    Heading1: "Heading 1",
                    Heading2: "Heading 2",
                    Heading3: "Heading 3"
                }
            }
        },
        Columns: {
            ProcessMenu: "Process Menu",
            Title: "Title",
            Status: "Status",
            DueDate: "Due Date",
            Approver: "Approver",
            Name: "Name",
            Email: "Email",
            AssignedTo: "Assigned To",
            CreatedBy: "Created By",
            Comment: "Comment",
            Edition: "Edition",
            Revision: "Revision",
            Published: "Published",
            ModifiedAt: "Modified",
            ModifiedBy: "Modified By",
            ApprovedBy: "Approved By",
            WorkflowHistory: "Workflow History"
        },
        Process: {
            Content: "Content",
            Documents: "Documents",
            Drawing: "Drawing",
            Links: "Links",
            Properties: "Properties",
            Tasks: "Tasks",
            LinkedProcess: "Linked Process"
        },
        Shape: "Shape",
        DrawingShapeSettings: {
            TextColor: "Text Color",
            HoverBackgroundColor: "Hover Background Color",
            HoverBorderColor: "Hover Border Color",
            HoverTextColor: "Hover Text Color",
            SelectedBackgroundColor: "Selected Background Color",
            SelectedBorderColor: "Selected Border Color",
            SelectedTextColor: "Selected Text Color",
            Width: "Width",
            Height: "Height",
            TextPosition: "Text Position",
            TextAlignment: "Text Alignment",
            TextAdjustment: "Text Adjustment",
            FontSize: "Font Size",
            Above: "Above Shape",
            On: "On Shape",
            Below: "Below Shape",
            Left: "Left",
            Center: "Center",
            Right: "Right"
        },
        Buttons: {
            DiscardChanges: "Discard changes",
            Design: "Design",
            Preview: "Preview",
            CheckIn: "Check In",
            DrawShape: "Draw Shape",
            RedrawShape: "Redraw Shape",
            AddImage: "Add Image",
            EditImage: "Edit Image",
            DrawFreeform: "Draw Freeform"
        },
        ShapeNames: {
            Freeform: "Freeform",
            Media: "Media"
        },
        Messages: {
            TaskCompleted: "Task completed.",
            AuthorPermissionIsRequried: "Author permission is requried.",
            MessageReviewReminderTaskEditingDescription: "Review the process and decide whether to create a new edition of the process, unpublish it or set a new review date.",
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
            MessageDraftExistCannotBeArchived: "This published process has a draft version and cannot be archived.",
            MessageDraftExist: "this process has a draft version.",
            SyncToSharePointFailed: "This process was synced to SharePoint failed.",
            ArchiveProcessFailed: "This process has been archived unsuccessfully.",
            ShapeTemplateHasBeenDeleted: "The shape template of this shape may have been deleted. Please select an alternative template.",
            UnauthorizedOrProcessNotFound: "Unauthrozied or Not Found."

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
            RetrySyncToSharePoint: "Retry",
            Archive: "Archive",
            NewProcess: "New Process",
            SetNewReviewDate: "Set new review date",
            Unpublish: "Unpublish",
            CloseTask: "Close task"
        },
        SearchTemplates: {
            ProcessSearchTemplate: {
                Preview: "Preview process",
                ClosePreview: "Close preview"
            }
        }
    });