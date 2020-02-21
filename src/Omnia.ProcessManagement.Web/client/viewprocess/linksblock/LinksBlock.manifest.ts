import { Composer } from '@omnia/tooling/composers';
import { FontAwesomeIcon } from '@omnia/fx-models';
import { OPMWebComponentManifests, OPMService } from '../../fx/models';

Composer
    .registerManifest(OPMWebComponentManifests.LinksBlock, "opm.viewprocess.links")
    .registerWebComponent({
        elementName: "opm-links-block",
        entryPoint: "./LinksBlock.jsx"
    })
    .withDefinition({
        title: "$Localize:OPM.Core.BlockDefinitions.Links.Title;",
        description: "$Localize:OPM.Core.BlockDefinitions.Links.Description;",
        icon: new FontAwesomeIcon("fal fa-link")
    })
    .registerOmniaBlock({
        category: "$Localize:OPM.Core.BlockDefinitions.ProcessInformation.Title;"
    })

Composer
    .registerManifest(OPMWebComponentManifests.LinksBlockSettings, "opm.viewprocess.links.settings")
    .registerWebComponent({
        elementName: "opm-links-block-settings",
        entryPoint: "./LinksBlockSettings.jsx",
        typings: ["./ILinksBlockSettings.ts"]
    })