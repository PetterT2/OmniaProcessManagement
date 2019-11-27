import { Composer } from "@omnia/tooling-composers";
import { OPMWebComponentManifests } from '../../../fx/models';

Composer
    .registerManifest(OPMWebComponentManifests.NewProcessDialog, "opm.new.process.dialog")
    .registerWebComponent({
        elementName: "opm-new-process-dialog",
        entryPoint: "./NewProcessDialog.jsx",
        typings: ["./INewProcessDialog.ts"]
    })

