import { Composer } from '@omnia/tooling/composers';
import { OPMAdminLocalization } from "./localize";

Composer.registerManifest("8394a64b-0f90-464a-b0f6-4c4f07cddbe2")
    .registerLocalization()
    .namespace(OPMAdminLocalization.namespace)
    .add<OPMAdminLocalization.locInterface>({
        ProcessManagement: "Process Management",
        Settings: "Settings",
        ProcessTypes: "Process Types",
        ProcessTemplates: "Process Templates"
    });