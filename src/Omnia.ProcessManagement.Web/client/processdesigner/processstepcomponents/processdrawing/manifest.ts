import { Composer } from '@omnia/tooling-composers';
import { OPMWebComponentManifests } from '../../../fx/models';

Composer
    .registerManifest(OPMWebComponentManifests.ProcessDesignerDrawingCanvasSettings, 'opm.processdesigner.drawingcanvassettings')
    .registerWebComponent({
        elementName: 'opm-processdesigner-drawingcanvas-settings',
        entryPoint: './DrawingCanvasSettings.jsx'
    })