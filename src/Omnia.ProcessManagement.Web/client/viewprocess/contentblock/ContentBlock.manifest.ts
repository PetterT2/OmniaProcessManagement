import { Composer } from '@omnia/tooling/composers';
import { FontAwesomeIcon } from '@omnia/fx-models';
import { OPMWebComponentManifests, OPMService } from '../../fx/models';

Composer
    .registerManifest(OPMWebComponentManifests.ContentBlock, "opm.viewprocess.content")
    .registerWebComponent({
        elementName: "opm-content-block",
        entryPoint: "./ContentBlock.jsx"
    })
    .withDefinition({
        title: "$Localize:OPM.Core.BlockDefinitions.Content.Title;",
        description: "$Localize:OPM.Core.BlockDefinitions.Content.Description;",
        icon: new FontAwesomeIcon("fa fa-font")
    })
    .registerOmniaBlock({
        category: "$Localize:OPM.Core.BlockDefinitions.ProcessInformation.Title;"
    })

Composer
    .registerManifest(OPMWebComponentManifests.ContentBlockSettings, "opm.viewprocess.content.settings")
    .registerWebComponent({
        elementName: "opm-content-block-settings",
        entryPoint: "./ContentBlockSettings.jsx",
        typings: ["./IContentBlockSettings.ts"]
    })