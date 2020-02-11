import { Composer } from '@omnia/tooling/composers';
import { OPMWebComponentManifests } from '../../fx/models';

Composer
    .registerManifest(OPMWebComponentManifests.PointPicker, "opm.point.picker")
    .registerWebComponent({
        elementName: "opm-point-picker",
        entryPoint: "./PointPicker.jsx",
        typings: ["./IPointPicker.ts"]
    })
