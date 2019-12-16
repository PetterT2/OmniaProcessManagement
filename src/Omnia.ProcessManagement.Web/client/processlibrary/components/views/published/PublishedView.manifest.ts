﻿import { Composer } from "@omnia/tooling-composers";
import { OPMWebComponentManifests } from '../../../../fx/models';

Composer
    .registerManifest(OPMWebComponentManifests.PublishedMenuActions, "opm.processlibrary.published.menu")
    .registerWebComponent({
        elementName: "opm-process-library-published-menu",
        entryPoint: "./PublishedMenuActions.jsx"
    }).withLoadRules().loadByDomMatching({ cssSelector: "opm-process-library-list-view" })

Composer
    .registerManifest(OPMWebComponentManifests.PublishedProcessingStatus, "opm.processlibrary.published.processingstatus")
    .registerWebComponent({
        elementName: "opm-process-library-published-processingstatus",
        entryPoint: "./PublishedProcessingStatus.jsx"
    }).withLoadRules().loadByDomMatching({ cssSelector: "opm-process-library-list-view" })