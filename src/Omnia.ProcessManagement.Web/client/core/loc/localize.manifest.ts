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
            ProcessLibrary: {
                Category: "Process Management",
                Description: "Creates a library to manage process in the site.",
                Title: "Processes Library"
            },
            ProcessManagement: {
                Category: "Tenant",
                Description: "",
                Title: "Process Management"
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
            }
        },
        BlockCategories: {
            Process: "Process"
        },
        Columns: {
            ProcessMenu: "Process Menu",
            Title: "Title"
        },
        Process: {
            Content: "Content",
            Documents: "Documents",
            Drawing: "Drawing",
            Links: "Links",
            Properties: "Properties",
            Tasks: "Tasks"
        },
        Buttons: {
            DiscardChanges: "Discard changes",
            Design: "Design",
            Preview: "Preview"
        }
    });