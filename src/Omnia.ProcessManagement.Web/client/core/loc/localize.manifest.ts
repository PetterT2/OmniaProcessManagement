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
                Title: "Archived Processes"
            },
            ProcessLibrary: {
                Category: "Process Management",
                Description: "Creates a library to manage process in the site.",
                Title: "Processes Library"
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
                Title: "Processes Content",
                Description: ""
            },
            Drawing: {
                Title: "Processes Drawing",
                Description: ""
            },
            ProcessInformation: {
                Title: "Process Information"
            },
            Tasks: {
                Title: "Processes Tasks",
                Description: ""
            },
            Links: {
                Title: "Processes Links",
                Description: ""
            },
            ProcessNavigation: {
                Title: "Process Navigation",
                Description: ""
            },
            ProcessRollup: {
                Title: "Process Rollup",
                Description: "Use this block to roll up processes with filter possibilities on the result."
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
            ActiveBackgroundColor: "Active Background Color",
            ActiveBorderColor: "Active Border Color",
            ActiveTextColor: "Active Text Color",
            Width: "Width",
            Height: "Height",
            TextPosition: "Text Position",
            FontSize: "Font Size",
            Above: "Above",
            On: "On",
            Below: "Below"
        },
        Buttons: {
            DiscardChanges: "Discard changes",
            Design: "Design",
            Preview: "Preview",
            SaveAsDraft: "Save As Draft"
        }
    });