import { Composer } from "@omnia/tooling-composers";

Composer
    .registerManifest('19d0af12-e1da-48b5-8ed4-f779a17c505e', "opm.admin.jorney")
    .registerWebComponent({
        elementName: "opm-admin-journey",
        entryPoint: "./AdminJourney.jsx"
    })


Composer
    .registerManifest('b01d1982-5ca1-4454-9821-67bc32691329', "opm.admin.core")
    .registerResources({
        resourcePaths: [
            './loc/**/*.js',
            './store/**/*.js',
            './model/index.js',
            "./AdminJourneyConstants.js"
        ]
    })
