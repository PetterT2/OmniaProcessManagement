import { Composer } from "@omnia/tooling-composers";
import { OPMWebComponentManifests } from '../../../fx/models';

Composer.registerManifest(OPMWebComponentManifests.ProcessFieldDisplay, "opm.ux.enterpriseproperties.display.processfield")
    .registerWebComponent({
        elementName: "opm-enterpriseproperties-process-display",
        entryPoint: "./ProcessFieldDisplay.tsx",
        typings: ["./IProcessFieldDisplay.ts"]
    });
