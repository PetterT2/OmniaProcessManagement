import { Composer } from '@omnia/tooling/composers';
import { OPMCoreLocalization } from "./localize";

Composer.registerManifest("523a6f8b-8ac0-4e3d-ac05-aa0b535636dd")
    .registerLocalization()
    .namespace(OPMCoreLocalization.namespace)
    .add<OPMCoreLocalization.locInterface>({
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
                OPMEdition: {
                    Name: "Edition",
                    Description: "System column in Omnia Process Management for Edition.",
                },
                OPMRevision: {
                    Name: "Revision",
                    Description: "System column in Omnia Process Management for Revision.",
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
        Blocks: {
            ProcessLibrary: {
                Title: "Processes Library",
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
            }
        },
        BlockCategories: {
            Process: "Process"
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

        },
        Process: {
            Content: "Content",
            Documents: "Documents",
            Drawing: "Drawing",
            Links: "Links",
            Properties: "Properties",
            Tasks: "Tasks"
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
            SaveAsDraft: "Save As Draft",
            DrawShape: "Draw Shape",
            RedrawShape: "Redraw Shape",
            AddImage: "Add Image",
            EditImage: "Edit Image",
            DrawFreeform: "Draw Freeform"
        },
        ShapeNames: {
            Freeform: "Freeform",
            Media: "Media"
        }
    });