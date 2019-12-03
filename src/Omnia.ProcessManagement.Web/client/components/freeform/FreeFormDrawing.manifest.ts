import { Composer } from '@omnia/tooling/composers';
import { OPMWebComponentManifests } from '../../fx/models';

Composer
    .registerManifest(OPMWebComponentManifests.FreeFormDrawing, "opm.freeform.drawing")
    .registerWebComponent({
        elementName: "opm-free-form-drawing",
        entryPoint: "./FreeFormDrawing.jsx",
        typings: ["./IFreeFormDrawing.ts"]
    })

