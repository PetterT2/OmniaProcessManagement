﻿import { Composer } from '@omnia/tooling/composers';
import { OPMCoreLocalization } from "./localize";

Composer.registerManifest("523a6f8b-8ac0-4e3d-ac05-aa0b535636dd")
    .registerLocalization()
    .namespace(OPMCoreLocalization.namespace)
    .add<OPMCoreLocalization.locInterface>({
        Features: {
            ProcessLibrary: {
                Category: "Process Management",
                Description: "Creates a library to manage process in the site.",
                Title: "Processes"
            }
        },
        Blocks: {
            ProcessLibrary: {
                Title: "Processes",
                Description: "Add this to a site where you want to work with processes."
            }
        },
        Columns: {
            Title: "Title"
        }
    });