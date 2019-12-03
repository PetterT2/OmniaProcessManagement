import { Composer } from '@omnia/tooling/composers';
import { OPMWebComponentManifests } from '../../fx/models';

Composer
    .registerManifest(OPMWebComponentManifests.FreeForm, "opm.freeform")
    .registerWebComponent({
        elementName: "opm-free-form",
        entryPoint: "./FreeForm.jsx",
        typings: ["./IFreeForm.ts"]
    })

