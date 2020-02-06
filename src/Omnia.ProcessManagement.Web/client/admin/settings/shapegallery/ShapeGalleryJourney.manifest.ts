import { Composer } from "@omnia/tooling-composers";

Composer
    .registerManifest('9274eaca-6dcf-44c9-93ab-a28974310c80', "opm.admin.shapegallery.journey")
    .registerWebComponent({
        elementName: "opm-admin-settings-shape-gallery-journey",
        entryPoint: "./ShapeGalleryJourney.jsx"
    });

Composer
    .registerManifest('688b6ba7-3d2a-47e3-bbbf-8d1d1834effb', "opm.admin.shapegallery.core")
    .registerResources({
        resourcePaths: [
            "./store/**/*.js",
            "./ShapeGalleryJourneyConstants.js"
        ]
    })