import { Composer } from '@omnia/tooling/composers';
import { OPMWebComponentManifests } from '../../fx/models';

Composer
    .registerManifest(OPMWebComponentManifests.UnpublishProcessDialog, "opm.unpublishprocess.dialog")
    .registerWebComponent({
        elementName: "opm-unpublishprocess-dialog",
        entryPoint: "./UnpublishProcessDialog.jsx",
        typings: ["./IUnpublishProcessDialog.ts"]
    })
