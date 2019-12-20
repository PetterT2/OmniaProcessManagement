import { Composer } from '@omnia/tooling-composers';
import { OPMResourceManifests } from '../../../../fx/models';

Composer
    .registerManifest(OPMResourceManifests.ProcessDesignerShapeSettingsPanel, 'opm.processdesigner.shapesettings')
    .registerWebComponent({
        elementName: 'opm-processdesigner-shape-settings',
        entryPoint: './ShapeSettingsPanel.jsx'
    })