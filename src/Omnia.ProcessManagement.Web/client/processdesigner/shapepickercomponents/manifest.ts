import { Composer } from "@omnia/tooling-composers";
import { OPMResourceManifests } from '../../fx/models';

Composer
    .registerManifest(OPMResourceManifests.ProcessDesignerShapePickerCore, "opm.processdesigner.shapepickercore")
    .registerResources({
        resourcePaths: [
            "./ShapeSelection.css.js",
            "./ShapeSelection.jsx",
            "./ShapeType.css.js",
            "./ShapeType.jsx"
        ]
    })