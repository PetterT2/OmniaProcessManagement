import { Composer } from "@omnia/tooling-composers";
import { OPMWebComponentManifests } from '../../../fx/models';

Composer.registerManifest(OPMWebComponentManifests.ProcessFieldEdit, "opm.ux.enterpriseproperties.edit.processfield")
    .registerWebComponent({
        elementName: "opm-enterpriseproperties-process-edit",
        entryPoint: "./ProcessFieldEdit.tsx",
        typings: ["./IProcessFieldEdit.ts"]
    });