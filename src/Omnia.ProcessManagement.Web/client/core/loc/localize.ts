export module OPMCoreLocalization {
    export const namespace = "OPM.Core";
    export interface locInterface {
        Common: {
            SearchBoxPlaceholder: string
        },
        Features: {
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
                }
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
                OPMProperties: {
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
            Email: string
        },
        Process: {
            Drawing: string,
            Content: string,
            Documents: string,
            Links: string,
            Tasks: string,
            Properties: string
        },
        DrawingShapeSettings: {
            TextColor: string,
            ActiveBackgroundColor: string,
            ActiveBorderColor: string,
            ActiveTextColor: string,
            Width: string,
            Height: string,
            TextPosition: string,
            FontSize: string,
            Above: string,
            Center: string,
            Below: string
        },
        Buttons: {
            DiscardChanges: string,
            Design: string,
            Preview: string,
            SaveAsDraft: string,
        }
    }
}