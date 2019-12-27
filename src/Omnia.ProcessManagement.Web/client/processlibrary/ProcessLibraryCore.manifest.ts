import { Composer } from '@omnia/tooling/composers';
import { OPMWebComponentManifests } from '../fx/models';

Composer
    .registerManifest(OPMWebComponentManifests.ProcessLibraryCore, "opm.processlibrary.core")
    .registerResources({
        resourcePaths: [
            './Constants.js',
            './services/**/*.js',
            './filtersandsorting/**/*.js',
            './loc/**/*.js',
            './factory/**/*.js',
        ]
    })