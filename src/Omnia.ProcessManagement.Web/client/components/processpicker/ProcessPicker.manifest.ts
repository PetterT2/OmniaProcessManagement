import { Composer } from "@omnia/tooling-composers";
import { OPMWebComponentManifests } from '../../fx/models';

Composer.registerManifest(OPMWebComponentManifests.ProcessPicker, "opm.process.picker")
    .registerWebComponent({
        elementName: "opm-process-picker",
        entryPoint: "./ProcessPicker.tsx",
        typings: ["./IProcessPicker.ts"]
    });
