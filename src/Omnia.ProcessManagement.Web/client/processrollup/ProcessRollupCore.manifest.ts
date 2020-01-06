import { Composer } from '@omnia/tooling/composers';
import { OPMResourceManifests } from '../fx/models';

Composer
    .registerManifest(OPMResourceManifests.ProcessRollupCore, "opm.processrollup.core")
    .registerResources({
        resourcePaths: [
            "./factory/**/*.js",
            "./loc/**/*.js"
        ]
    });