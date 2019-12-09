import { Composer } from '@omnia/tooling-composers';
import { OPMResourceManifests } from '../../../../fx/models';

Composer
    .registerManifest(OPMResourceManifests.ProcessDesignerShapeSelectionStep, 'opm.processdesigner.shapeselectionstep')
    .registerWebComponent({
        elementName: 'opm-processdesigner-shapeselection-step',
        entryPoint: './ShapeSelectionStep.jsx'
    })
Composer
    .registerManifest(OPMResourceManifests.ProcessDesignerShapeTypeStep, 'opm.processdesigner.shapetypestep')
    .registerWebComponent({
        elementName: 'opm-processdesigner-shapetype-step',
        entryPoint: './ShapeTypeStep.jsx'
    })
Composer
    .registerManifest(OPMResourceManifests.ProcessDesignerAddShapeWizard, 'opm.processdesigner.addshapewizard')
    .registerWebComponent({
        elementName: 'opm-processdesigner-addshape-wizard',
        entryPoint: './AddShapePanel.jsx'
    })