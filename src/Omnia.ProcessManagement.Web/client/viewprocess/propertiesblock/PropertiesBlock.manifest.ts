import { Composer } from '@omnia/tooling/composers';
import { FontAwesomeIcon } from '@omnia/fx-models';
import { OPMWebComponentManifests, OPMService } from '../../fx/models';

Composer
    .registerManifest(OPMWebComponentManifests.PropertiesBlock, "opm.viewprocess.properties")
    .registerWebComponent({
        elementName: "opm-properties-block",
        entryPoint: "./PropertiesBlock.jsx"
    })
    .withDefinition({
        title: "$Localize:OPM.Core.BlockDefinitions.Properties.Title;",
        description: "$Localize:OPM.Core.BlockDefinitions.Properties.Description;",
        icon: new FontAwesomeIcon("fas fa-info")
    })
    .registerOmniaBlock({
        category: "$Localize:OPM.Core.BlockDefinitions.ProcessInformation.Title;"
    })

Composer
    .registerManifest(OPMWebComponentManifests.PropertiesBlockSettings, "opm.viewprocess.properties.settings")
    .registerWebComponent({
        elementName: "opm-properties-block-settings",
        entryPoint: "./PropertiesBlockSettings.jsx",
        typings: ["./IPropertiesBlockSettings.ts"]
    })