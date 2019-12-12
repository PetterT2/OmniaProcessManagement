import { Composer } from '@omnia/tooling/composers';
import { Guid } from '@omnia/fx-models';
import { OPMResourceManifests } from '../fx/models';

Composer
    .registerManifest(OPMResourceManifests.ProcessDesignerCore, "opm.processdesigner.core")
    .registerResources({
        resourcePaths: [
            "./core/index.js",
            "./loc/**/*.js",
            "./stores/ProcessDesignerStore.js",
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
    .registerManifest(OPMResourceManifests.ProcessDesigner, 'opm.processdesigner')
    .registerWebComponent({
        elementName: 'opm-processdesigner',
        entryPoint: './ProcessDesigner.jsx',

    })
    .withDependency(OPMResourceManifests.FxCore);

//ToDo: Remove this testing
Composer
    .registerManifest("3fc1d9b7-1602-4d3b-9a65-8e01dfbe0a1b", 'opm.temptest')
    .registerWebComponent({
        elementName: 'opm-temptest',
        entryPoint: './TempTestComponent.jsx'
    });


