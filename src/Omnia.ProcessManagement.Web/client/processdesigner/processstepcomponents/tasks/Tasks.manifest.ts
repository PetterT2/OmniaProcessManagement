import { Composer } from "@omnia/tooling-composers";
import { OPMResourceManifests } from '../../../fx/models';

Composer
    .registerManifest(OPMResourceManifests.ProcessDesignerCreateTask, 'opm.processdesigner.createtask')
    .registerWebComponent({
        elementName: 'opm-processdesigner-createtask',
        entryPoint: './CreateTask.jsx',
        typings: ["./ICreateTask.ts"]
    });
