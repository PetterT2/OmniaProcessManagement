import { Composer } from '@omnia/tooling/composers';
import { Guid } from '@omnia/fx-models';
import { OPMResourceManifests } from '../../fx/models';

Composer
    .registerManifest(OPMResourceManifests.ProcessDesignerProcessRenderer, 'opm.processdesigner.processrenderer')
    .registerWebComponent({
        elementName: 'opm-process-renderer',
        entryPoint: './ProcessRenderer.jsx',

    })
    .withDependency(OPMResourceManifests.FxCore);
