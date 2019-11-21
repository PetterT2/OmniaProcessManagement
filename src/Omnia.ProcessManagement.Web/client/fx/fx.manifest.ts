import { Composer } from '@omnia/tooling/composers';
import { OPMResourceManifests } from './models';


Composer
    .registerManifest(OPMResourceManifests.FxCore, "opm.fx.core")
    .registerResources({
        resourcePaths: [
            "./models/**/*.js",
            "./constants.js",
            "./processshape/**/*.js"
        ]
    })