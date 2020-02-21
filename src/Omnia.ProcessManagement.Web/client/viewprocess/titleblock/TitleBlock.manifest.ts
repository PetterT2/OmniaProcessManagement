import { Composer } from "@omnia/tooling-composers";
import { OPMWebComponentManifests } from '../../fx/models';
import { FontAwesomeIcon } from '@omnia/fx-models';

Composer
    .registerManifest(OPMWebComponentManifests.TitleBlock, "opm.viewprocess.title")
    .registerWebComponent({
        elementName: "opm-title-block",
        entryPoint: "./TitleBlock.jsx"
    })
    .withDefinition({
        title: "$Localize:OPM.Core.BlockDefinitions.Title.Title;",
        description: "$Localize:OPM.Core.BlockDefinitions.Title.Description;",
        icon: new FontAwesomeIcon("fa fa-font")
    })
    .registerOmniaBlock({
        category: "$Localize:OPM.Core.BlockDefinitions.ProcessInformation.Title;"
    })

Composer
    .registerManifest(OPMWebComponentManifests.TitleBlockSettings, "opm.viewprocess.title.settings")
    .registerWebComponent({
        elementName: "opm-title-block-settings",
        entryPoint: "./TitleBlockSettings.jsx",
        typings: ["./ITitleBlockSettings.ts"]
    })