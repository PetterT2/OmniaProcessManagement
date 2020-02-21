import { Composer } from '@omnia/tooling/composers';
import { FontAwesomeIcon } from '@omnia/fx-models';
import { OPMWebComponentManifests, OPMService } from '../../fx/models';

Composer
    .registerManifest(OPMWebComponentManifests.DrawingBlock, "opm.viewprocess.drawing")
    .registerWebComponent({
        elementName: "opm-drawing-block",
        entryPoint: "./DrawingBlock.jsx"
    })
    .withDefinition({
        title: "$Localize:OPM.Core.BlockDefinitions.Drawing.Title;",
        description: "$Localize:OPM.Core.BlockDefinitions.Drawing.Description;",
        icon: new FontAwesomeIcon("fa fa-image")
    })
    .registerOmniaBlock({
        category: "$Localize:OPM.Core.BlockDefinitions.ProcessInformation.Title;"
    })

Composer
    .registerManifest(OPMWebComponentManifests.DrawingBlockSettings, "opm.viewprocess.drawing.settings")
    .registerWebComponent({
        elementName: "opm-drawing-block-settings",
        entryPoint: "./DrawingBlockSettings.jsx",
        typings: ["./IDrawingBlockSettings.ts"]
    })