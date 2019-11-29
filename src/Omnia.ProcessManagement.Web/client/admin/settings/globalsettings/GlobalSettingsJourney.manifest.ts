import { Composer } from "@omnia/tooling-composers";

Composer
    .registerManifest('a8ef9684-254b-4aa7-9a1d-f9ba4a2d6e93', "opm.admin.globalsettings.journey")
    .registerWebComponent({
        elementName: "opm-admin-settings-globalsettings-journey",
        entryPoint: "./GlobalSettingsJourney.jsx"
    });

Composer
    .registerManifest('31228101-3505-4c44-bffe-3a18b590304c', "opm.admin.globalsettings.core")
    .registerResources({
        resourcePaths: [
            "./GlobalSettingsJourneyConstants.js"
        ]
    })