import { Composer } from '@omnia/tooling/composers';
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
            "./utils.js",
            "./processshape/**/*.js"
        ]
    })
    //Note: LoadRules with loadByUrlMatching using regEx should be the correct one to use, but currently it only trigger in the browser first load. Need to fix in OmniaFx
    .withLoadRules().loadByUrlMatching({
        regEx: '\/@pm\/'
    })

    //Temp
    //.withLoadRules().loadByUrlMatching({
    //    startsWith: "/"
    //})