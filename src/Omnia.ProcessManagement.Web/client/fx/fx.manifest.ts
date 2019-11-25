﻿import { Composer } from '@omnia/tooling/composers';
import { OPMResourceManifests } from './models';


Composer
    .registerManifest(OPMResourceManifests.FxCore, "opm.fx.core")
    .registerResources({
        resourcePaths: [
            "./index.js",
            "./models/**/*.js",
            "./routing/**/*.js",
            "./services/**/*.js",
            "./stores/**/*.js",
            "./constants.js",
            "./processshape/**/*.js"
        ]
    })