import { Composer } from "@omnia/tooling-composers";

Composer
    .registerManifest('579913cb-5d70-44a1-9440-9bf3048285cd', "opm.admin.processtemplates.journey")
    .registerWebComponent({
        elementName: "opm-admin-settings-process-templates-journey",
        entryPoint: "./ProcessTemplatesJourney.jsx"
    });

Composer
    .registerManifest('4e5fdff2-0dc0-4ce7-879e-0817536553b9', "opm.admin.processtemplates.core")
    .registerResources({
        resourcePaths: [
            "./store/**/*.js",
            "./ProcessTemplatesJourneyConstants.js"
        ]
    })