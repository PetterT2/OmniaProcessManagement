import { Composer } from '@omnia/tooling/composers';
import { Guid } from '@omnia/fx-models';
import { OPMWebComponentManifests } from '../../fx/models';


Composer
    .registerManifest(OPMWebComponentManifests.AddLinkedProcess, 'opm.processdesigner.addlinkedprocess')
    .registerWebComponent({
        elementName: 'opm-processdesigner-addlinkedprocess',
        entryPoint: './AddLinkedProcess.jsx',
        typings: ["./IAddLinkedProcess.ts"]
    });
