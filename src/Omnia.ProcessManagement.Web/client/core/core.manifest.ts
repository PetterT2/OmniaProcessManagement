import { Composer } from '@omnia/tooling/composers';
import { OPMResourceManifests } from '../fx/models';

Composer
    .registerManifest(OPMResourceManifests.Core, "omnia.pm.core")
    .registerResources({
        resourcePaths: [
            "../models/**/*.js",
            "../components/richtexteditorextensions/**/*.js",
            "./loc/**/*.js",
            "./styles/**/*.js"
        ]
    });