import { Composer } from '@omnia/tooling/composers';
import { OPMPermissionDialogLocalization } from "./localize";

Composer.registerManifest("B6461912-81C6-4F66-9FFC-83CFD0D42B46")
    .registerLocalization()
    .namespace(OPMPermissionDialogLocalization.namespace)
    .add<OPMPermissionDialogLocalization.locInterface>({
        DialogTitle: "Process Library Permissions",
        NoPermissionMsg: "You don't have permission",
        Authors: "Authors",
        DefaultReaders: "Default Readers"
    });