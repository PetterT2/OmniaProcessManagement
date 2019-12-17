import { Composer } from '@omnia/tooling/composers';
import { OPMWebComponentManifests } from '../../fx/models';

Composer
    .registerManifest(OPMWebComponentManifests.PermissionDialog, "opm.permission.dialog")
    .registerWebComponent({
        elementName: "opm-permission-dialog",
        entryPoint: "./PermissionDialog.jsx",
        typings: ["./IPermissionDialog.ts"]
    })
