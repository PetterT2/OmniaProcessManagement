import { Composer } from '@omnia/tooling/composers';
import { Guid } from '@omnia/fx-models';
import { OPMResourceManifests, OPMWebComponentManifests } from '../fx/models';

Composer
    .registerManifest(OPMResourceManifests.ProcessDesignerCore, "opm.processdesigner.core")
    .registerResources({
        resourcePaths: [
            "./core/index.js",
            "./loc/**/*.js",
            "./stores/ProcessDesignerStore.js",
            "./stores/ProcessDesignerTabStore.js",
            "./stores/index.js",
            "./stores/AddShapeWizardStore.js",
            "./RawStyles.css.js", ,
            "./ProcessDesigner.css.js",
            "./Utils.js"
        ]
    })

Composer
    .registerManifest(OPMResourceManifests.ProcessDesignerItem, "opm.processdesigner.items")
    .registerResources({
        resourcePaths: [
            "./designeritems/**/*.js"
        ]
    })

Composer
    .registerManifest(OPMWebComponentManifests.ProcessDesigner, 'opm.processdesigner')
    .registerWebComponent({
        elementName: 'opm-processdesigner',
        entryPoint: './ProcessDesigner.jsx',

    })
    .withDependency(OPMResourceManifests.FxCore);


