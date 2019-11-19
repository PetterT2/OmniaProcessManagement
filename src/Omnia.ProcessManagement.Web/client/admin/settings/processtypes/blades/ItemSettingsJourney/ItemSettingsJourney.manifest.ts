import { Composer } from "@omnia/tooling-composers";

Composer
    .registerManifest('0ec7443d-c12c-4922-902b-88305e2c75d4', "opm.admin.processtype.itemsettings.jorney")
    .registerWebComponent({
        elementName: "opm-admin-settings-processtype-itemsettings-journey",
        entryPoint: "./ItemSettingsJourney.jsx"
    });