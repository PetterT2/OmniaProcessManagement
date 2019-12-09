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
            Title: string
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