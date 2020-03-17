import { Composer } from "@omnia/tooling-composers";
import { OPMWebComponentManifests } from '../../../fx/models';

Composer
    .registerManifest(OPMWebComponentManifests.ProcessDesignerCreateLinkPanel, 'opm.processdesigner.createlink')
    .registerWebComponent({
        elementName: 'opm-processdesigner-createlink',
        entryPoint: './CreateLinkPanel.jsx',
        typings: ["./ICreateLinkPanel.ts"]
    });
