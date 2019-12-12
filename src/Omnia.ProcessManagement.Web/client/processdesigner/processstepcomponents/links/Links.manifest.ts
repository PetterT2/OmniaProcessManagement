import { Composer } from "@omnia/tooling-composers";
import { OPMResourceManifests } from '../../../fx/models';

Composer
    .registerManifest(OPMResourceManifests.ProcessDesignerCreateLinkPanel, 'opm.processdesigner.createlink')
    .registerWebComponent({
        elementName: 'opm-processdesigner-createlink',
        entryPoint: './CreateLinkPanel.jsx'
    });
