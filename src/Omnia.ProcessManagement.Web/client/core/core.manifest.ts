import { Composer } from '@omnia/tooling/composers';
import { OPMResourceManifests } from '../fx/models';

Composer
    .registerManifest(OPMResourceManifests.Core, "omnia.pm.core")
    .registerResources({
        resourcePaths: [
            "../stores/**/*.js",
            "../services/**/*.js",
            "./index.js"
        ]
    })