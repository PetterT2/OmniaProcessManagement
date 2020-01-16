import { Composer } from '@omnia/tooling/composers';
import { FontAwesomeIcon } from '@omnia/fx-models';
import { OPMWebComponentManifests, OPMService } from '../../fx/models';

Composer
    .registerManifest(OPMWebComponentManifests.ProcessNavigationBlockCore, "opm.viewprocess.processnavigation.core")
    .registerResources({
        resourcePaths: [
            './loc/**/*.js'
        ]
    })

Composer
    .registerManifest(OPMWebComponentManifests.ProcessNavigationBlock, "opm.viewprocess.processnavigation")
    .registerWebComponent({
        elementName: "opm-processnavigation-block",
        entryPoint: "./ProcessNavigationBlock.jsx"
    })
    .withDefinition({
        title: "$Localize:OPM.Core.Blocks.ProcessNavigation.Title;",
        description: "$Localize:OPM.Core.Blocks.ProcessNavigation.Description;",
        icon: new FontAwesomeIcon("fas fa-bars")
    })
    .registerOmniaBlock({
        category: "$Localize:OPM.Core.Blocks.ProcessInformation.Title;"
    })

Composer
    .registerManifest(OPMWebComponentManifests.ProcessNavigationBlockSettings, "opm.viewprocess.processnavigation.settings")
    .registerWebComponent({
        elementName: "opm-processnavigation-block-settings",
        entryPoint: "./ProcessNavigationBlockSettings.jsx",
        typings: ["./IProcessNavigationBlockSettings.ts"]
    })