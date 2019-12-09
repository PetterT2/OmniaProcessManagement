import { Composer } from '@omnia/tooling/composers';
import { FontAwesomeIcon } from '@omnia/fx-models';
import { OPMWebComponentManifests, OPMService } from '../../fx/models';

Composer
    .registerManifest(OPMWebComponentManifests.ProcessLibrary, "opm.processlibrary")
    .registerWebComponent({
        elementName: "opm-process-library",
        entryPoint: "./ProcessLibrary.jsx"
    })
    .withDefinition({
        title: "$Localize:OPM.Core.Blocks.ProcessLibrary.Title;",
        description: "$Localize:OPM.Core.Blocks.ProcessLibrary.Description;",
        icon: new FontAwesomeIcon("fal fa-angle-double-right")
    })
    .registerSpfxWebpart({
        category: "$Localize:OPM.Core.Blocks.ProcessLibrary.Title;"
    })

Composer
    .registerManifest(OPMWebComponentManifests.ProcessLibrarySettings, "opm.processlibrary.settings")
    .registerWebComponent({
        elementName: "opm-process-library-settings",
        entryPoint: "./ProcessLibrarySettings.jsx"
    })