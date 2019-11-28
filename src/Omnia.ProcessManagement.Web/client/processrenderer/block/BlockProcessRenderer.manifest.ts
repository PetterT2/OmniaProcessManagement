import { Composer } from '@omnia/tooling/composers';
import { OPMWebComponentManifests, OPMService, OPMResourceManifests } from '../../fx/models';

Composer
    .registerManifest(OPMWebComponentManifests.BlockProcessRenderer, "opm.blockprocessrenderer")
    .registerWebComponent({
        elementName: "opm-block-process-renderer",
        entryPoint: "./BlockProcessRenderer.jsx"
    });

