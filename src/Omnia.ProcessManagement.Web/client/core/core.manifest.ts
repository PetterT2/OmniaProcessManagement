import { Composer } from '@omnia/tooling/composers';
import { OPMResourceManifests } from '../fx/models';

Composer
    .registerManifest(OPMResourceManifests.Core, "omnia.pm.core")
    .registerResources({
        resourcePaths: [
            "../models/**/*.js",
            "../components/richtexteditorextensions/**/*.js",
            "./loc/**/*.js"
        ]
    });


Composer
    .registerManifest(OPMResourceManifests.DialogCoreStyles, "omnia.pm.dialogcorestyles")
    .registerResources({
        resourcePaths: [
            "./styles/dialog/**/*.js"
        ]
    });