import { Composer } from '@omnia/tooling/composers';
import { FontAwesomeIcon } from '@omnia/fx-models';
import { OPMWebComponentManifests, OPMService } from '../../fx/models';

Composer
    .registerManifest(OPMWebComponentManifests.LinksBlockCore, "opm.viewprocess.links.core")
    .registerResources({
        resourcePaths: [
            './loc/**/*.js'
        ]
    })

Composer
    .registerManifest(OPMWebComponentManifests.LinksBlock, "opm.viewprocess.links")
    .registerWebComponent({
        elementName: "opm-links-block",
        entryPoint: "./LinksBlock.jsx"
    })
    .withDefinition({
        title: "$Localize:OPM.Core.Blocks.Links.Title;",
        description: "$Localize:OPM.Core.Blocks.Links.Description;",
        icon: new FontAwesomeIcon("fal fa-link")
    })
    .registerOmniaBlock({
        category: "$Localize:OPM.Core.Blocks.ProcessInformation.Title;"
    })

Composer
    .registerManifest(OPMWebComponentManifests.LinksBlockSettings, "opm.viewprocess.links.settings")
    .registerWebComponent({
        elementName: "opm-links-block-settings",
        entryPoint: "./LinksBlockSettings.jsx",
        typings: ["./ILinksBlockSettings.ts"]
    })