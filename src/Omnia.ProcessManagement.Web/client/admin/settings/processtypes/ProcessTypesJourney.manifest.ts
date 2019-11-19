import { Composer } from "@omnia/tooling-composers";

Composer
    .registerManifest('8109e5e6-33b6-441b-961a-61381ab729cf', "opm.admin.processtypes.jorney")
    .registerWebComponent({
        elementName: "opm-admin-settings-processtypes-journey",
        entryPoint: "./ProcessTypesJourney.jsx"
    });

Composer
    .registerManifest('ff1480c2-626b-41d0-a3c8-ff9e7422423b', "opm.admin.processtypes.core")
    .registerResources({
        resourcePaths: [
            './service/**/*.js',
            './store/**/*.js',
            './core/**/*.js',
            "./ProcessTypesJourneyConstants.js"
        ]
    })