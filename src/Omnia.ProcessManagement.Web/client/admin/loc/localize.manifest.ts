﻿import { Composer } from '@omnia/tooling/composers';
import { OPMAdminLocalization } from "./localize";

Composer.registerManifest("8394a64b-0f90-464a-b0f6-4c4f07cddbe2")
    .registerLocalization()
    .namespace(OPMAdminLocalization.namespace)
    .add<OPMAdminLocalization.locInterface>({
        ProcessManagement: "Process Management",
        Settings: "Settings",
        ArchiveSiteUrl: "Archive Site Url",
        ProcessTypes: {
            Title: "Process Types",
            Messages: {
                ProcessTypesTermSetNotFound: "Term Set for Process Types is not found"
            }
        },
        ProcessTemplates: {
            Title: "Process Templates",
            SettingsTabs: {
                General: "General",
                Shapes: "Shapes",
                DefaultContent: "Default Content"
            },
            CreateProcessTemplate: "Create Process Template",
            AddHeading: "Add Heading",
            AddShape: "Add Shape",
            ShapeSettings: {
                TextColor: "Text Color",
                ActiveBackgroundColor: "Active Background Color",
                ActiveBorderColor: "Active Border Color",
                ActiveTextColor: "Active Text Color",
                Width: "Width",
                Height: "Height",
                TextPosition: "Text Position",
                FontSize: "Font Size",
                Above: "Above",
                Center: "Center",
                Below: "Below"
            },
            Messages: {
                NoProcessTemplate: "There's no process template.",
                NoShapeTemplate: "There's no shape template."
            }
        }
    });