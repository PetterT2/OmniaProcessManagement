import { Composer } from '@omnia/tooling/composers';
import { OPMWebComponentManifests } from '../../fx/models';

Composer
    .registerManifest(OPMWebComponentManifests.FreeformPicker, "opm.freeformpicker")
    .registerWebComponent({
        elementName: "opm-freeform-picker",
        entryPoint: "./FreeformPicker.jsx",
        typings: ["./IFreeformPicker.ts"]
    });


