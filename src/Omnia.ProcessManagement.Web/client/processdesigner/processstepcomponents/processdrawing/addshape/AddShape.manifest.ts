import { Composer } from '@omnia/tooling-composers';
import { OPMResourceManifests, OPMWebComponentManifests, OPMService } from '../../../../fx/models';

Composer
    .registerManifest(OPMWebComponentManifests.ProcessDesignerAddShapeWizard, 'opm.processdesigner.addshapewizard')
    .registerWebComponent({
        elementName: 'opm-processdesigner-addshape-wizard',
        entryPoint: './AddShapePanel.jsx'
    })


Composer
    .registerManifest(OPMWebComponentManifests.ProcessDesignerShapeSelectionStep, 'opm.processdesigner.shapeselectionstep')
    .registerWebComponent({
        elementName: 'opm-processdesigner-shapeselection-step',
        entryPoint: './ShapeSelectionStep.jsx'
    })
    .withLoadRules()
    .loadIfManifestLoaded({ omniaServiceId: OPMService.Id.toString(), resourceId: OPMWebComponentManifests.ProcessDesignerAddShapeWizard.toString() })

Composer
    .registerManifest(OPMWebComponentManifests.ProcessDesignerShapeTypeStep, 'opm.processdesigner.shapetypestep')
    .registerWebComponent({
        elementName: 'opm-processdesigner-shapetype-step',
        entryPoint: './ShapeTypeStep.jsx'
    })
    .withLoadRules()
    .loadIfManifestLoaded({ omniaServiceId: OPMService.Id.toString(), resourceId: OPMWebComponentManifests.ProcessDesignerAddShapeWizard.toString() })