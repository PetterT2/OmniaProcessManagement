import { Composer } from "@omnia/tooling-composers";
import { OPMWebComponentManifests } from '../../../fx/models';

Composer
    .registerManifest(OPMWebComponentManifests.ProcessHistoryDialog, "opm.process.history.dialog")
    .registerWebComponent({
        elementName: "opm-process-history-dialog",
        entryPoint: "./ProcessHistoryDialog.jsx",
        typings: ["./IProcessHistoryDialog.ts"]
    })

