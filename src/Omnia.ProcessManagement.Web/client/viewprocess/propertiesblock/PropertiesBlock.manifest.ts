import { Composer } from '@omnia/tooling/composers';
import { FontAwesomeIcon } from '@omnia/fx-models';
import { OPMWebComponentManifests, OPMService } from '../../fx/models';

Composer
    .registerManifest(OPMWebComponentManifests.PropertiesBlockCore, "opm.viewprocess.properties.core")
    .registerResources({
        resourcePaths: [
            './loc/**/*.js'
        ]
    })

Composer
    .registerManifest(OPMWebComponentManifests.PropertiesBlock, "opm.viewprocess.properties")
    .registerWebComponent({
        elementName: "opm-properties-block",
        entryPoint: "./PropertiesBlock.jsx"
    })
    .withDefinition({
        title: "$Localize:OPM.Core.Blocks.Properties.Title;",
        description: "$Localize:OPM.Core.Blocks.Properties.Description;",
        icon: new FontAwesomeIcon("fas fa-info")
    })
    .registerOmniaBlock({
        category: "$Localize:OPM.Core.Blocks.ProcessInformation.Title;"
    })

Composer
    .registerManifest(OPMWebComponentManifests.PropertiesBlockSettings, "opm.viewprocess.properties.settings")
    .registerWebComponent({
        elementName: "opm-properties-block-settings",
        entryPoint: "./PropertiesBlockSettings.jsx",
        typings: ["./IPropertiesBlockSettings.ts"]
    })