import { Composer } from '@omnia/tooling-composers';
import { OPMResourceManifests, OPMService } from '../../../../fx/models';

Composer
    .registerManifest(OPMResourceManifests.ProcessDesignerAddShapeWizard, 'opm.processdesigner.addshapewizard')
    .registerWebComponent({
        elementName: 'opm-processdesigner-addshape-wizard',
        entryPoint: './AddShapePanel.jsx'
    })


Composer
    .registerManifest(OPMResourceManifests.ProcessDesignerShapeSelectionStep, 'opm.processdesigner.shapeselectionstep')
    .registerWebComponent({
        elementName: 'opm-processdesigner-shapeselection-step',
        entryPoint: './ShapeSelectionStep.jsx'
    })
    .withLoadRules()
    .loadIfManifestLoaded({ omniaServiceId: OPMService.Id.toString(), resourceId: OPMResourceManifests.ProcessDesignerAddShapeWizard.toString() })

Composer
    .registerManifest(OPMResourceManifests.ProcessDesignerShapeTypeStep, 'opm.processdesigner.shapetypestep')
    .registerWebComponent({
        elementName: 'opm-processdesigner-shapetype-step',
        entryPoint: './ShapeTypeStep.jsx'
    })
    .withLoadRules()
    .loadIfManifestLoaded({ omniaServiceId: OPMService.Id.toString(), resourceId: OPMResourceManifests.ProcessDesignerAddShapeWizard.toString() })