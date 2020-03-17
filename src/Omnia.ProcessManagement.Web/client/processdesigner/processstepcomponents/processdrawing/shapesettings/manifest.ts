import { Composer } from '@omnia/tooling-composers';
import { OPMWebComponentManifests } from '../../../../fx/models';

Composer
    .registerManifest(OPMWebComponentManifests.ProcessDesignerShapeSettingsPanel, 'opm.processdesigner.shapesettings')
    .registerWebComponent({
        elementName: 'opm-processdesigner-shape-settings',
        entryPoint: './ShapeSettingsPanel.jsx'
    })