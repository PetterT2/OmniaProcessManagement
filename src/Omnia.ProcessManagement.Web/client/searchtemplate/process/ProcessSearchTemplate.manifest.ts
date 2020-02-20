import { Composer } from '@omnia/tooling/composers';
import { OPMWebComponentManifests } from '../../fx/models';

Composer.registerManifest(OPMWebComponentManifests.ProcessSearchTemplate, "omnia.opm.search.template.process")
    .registerWebComponent({
        elementName: "omnia-opm-process-template",
        entryPoint: "./ProcessSearchTemplate.jsx",
    });