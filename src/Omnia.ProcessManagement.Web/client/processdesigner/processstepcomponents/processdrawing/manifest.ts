import { Composer } from '@omnia/tooling-composers';
import { OPMResourceManifests } from '../../../fx/models';

Composer
    .registerManifest(OPMResourceManifests.ProcessDesignerDrawingCanvasSettings, 'opm.processdesigner.drawingcanvassettings')
    .registerWebComponent({
        elementName: 'opm-processdesigner-drawingcanvas-settings',
        entryPoint: './DrawingCanvasSettings.jsx'
    })