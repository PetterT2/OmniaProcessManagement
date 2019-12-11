import { Composer } from '@omnia/tooling/composers';
import { OPMWebComponentManifests } from '../../fx/models';

Composer
    .registerManifest(OPMWebComponentManifests.ProcessStepPicker, "opm.process.step.picker")
    .registerWebComponent({
        elementName: "opm-process-step-picker",
        entryPoint: "./ProcessStepPicker.jsx",
        typings: ["./IProcessStepPicker.ts"]
    })

