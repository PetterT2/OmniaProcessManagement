import { Composer } from "@omnia/tooling-composers";
import { OPMWebComponentManifests } from '../../../../fx/models';

Composer
    .registerManifest(OPMWebComponentManifests.DraftActionButtons, "opm.processlibrary.drafts.buttons")
    .registerWebComponent({
        elementName: "opm-process-library-drafts-buttons",
        entryPoint: "./DraftsActionButtons.jsx"
    }).withLoadRules().loadByDomMatching({ cssSelector: "opm-process-library-list-view" })

Composer
    .registerManifest(OPMWebComponentManifests.DraftMenuActions, "opm.processlibrary.drafts.menu")
    .registerWebComponent({
        elementName: "opm-process-library-drafts-menu",
        entryPoint: "./DraftsMenuActions.jsx"
    }).withLoadRules().loadByDomMatching({ cssSelector: "opm-process-library-list-view" })

Composer
    .registerManifest(OPMWebComponentManifests.DraftProcessingStatus, "opm.processlibrary.drafts.processingstatus")
    .registerWebComponent({
        elementName: "opm-process-library-drafts-processingstatus",
        entryPoint: "./DraftsProcessingStatus.jsx"
    }).withLoadRules().loadByDomMatching({ cssSelector: "opm-process-library-list-view" })