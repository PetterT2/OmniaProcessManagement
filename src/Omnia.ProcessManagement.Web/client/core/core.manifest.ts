import { Composer } from '@omnia/tooling/composers';
import { PmResourceManifests } from '../fx/models';

Composer
    .registerManifest(PmResourceManifests.Core, "omnia.dm.core")
    .registerResources({
        resourcePaths: [
            "../services/**/*.js",
            "./index.js"
        ]
    })