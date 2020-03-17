import { Composer } from "@omnia/tooling-composers";
import { OPMWebComponentManifests } from '../../../fx/models';

Composer
    .registerManifest(OPMWebComponentManifests.ProcessDesignerCreateTask, 'opm.processdesigner.createtask')
    .registerWebComponent({
        elementName: 'opm-processdesigner-createtask',
        entryPoint: './CreateTask.jsx',
        typings: ["./ICreateTask.ts"]
    });
