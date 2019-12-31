import { Composer } from '@omnia/tooling/composers';
import { FontAwesomeIcon } from '@omnia/fx-models';
import { OPMWebComponentManifests, OPMService } from '../../fx/models';

Composer
    .registerManifest(OPMWebComponentManifests.ContentBlockCore, "opm.viewprocess.content.core")
    .registerResources({
        resourcePaths: [
            './loc/**/*.js'
        ]
    })

Composer
    .registerManifest(OPMWebComponentManifests.ContentBlock, "opm.viewprocess.content")
    .registerWebComponent({
        elementName: "opm-content-block",
        entryPoint: "./ContentBlock.jsx"
    })
    .withDefinition({
        title: "$Localize:OPM.Core.Blocks.Content.Title;",
        description: "$Localize:OPM.Core.Blocks.Content.Description;",
        icon: new FontAwesomeIcon("fa fa-font")
    })
    .registerOmniaBlock({
        category: "$Localize:OPM.Core.Blocks.ViewProcess.Title;"
    })

Composer
    .registerManifest(OPMWebComponentManifests.ContentBlockSettings, "opm.viewprocess.content.settings")
    .registerWebComponent({
        elementName: "opm-content-block-settings",
        entryPoint: "./ContentBlockSettings.jsx",
        typings: ["./IContentBlockSettings.ts"]
    })