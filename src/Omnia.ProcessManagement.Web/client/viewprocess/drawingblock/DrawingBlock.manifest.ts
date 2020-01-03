import { Composer } from '@omnia/tooling/composers';
import { FontAwesomeIcon } from '@omnia/fx-models';
import { OPMWebComponentManifests, OPMService } from '../../fx/models';

Composer
    .registerManifest(OPMWebComponentManifests.DrawingBlockCore, "opm.viewprocess.drawing.core")
    .registerResources({
        resourcePaths: [
            './loc/**/*.js'
        ]
    })

Composer
    .registerManifest(OPMWebComponentManifests.DrawingBlock, "opm.viewprocess.drawing")
    .registerWebComponent({
        elementName: "opm-drawing-block",
        entryPoint: "./DrawingBlock.jsx"
    })
    .withDefinition({
        title: "$Localize:OPM.Core.Blocks.Drawing.Title;",
        description: "$Localize:OPM.Core.Blocks.Drawing.Description;",
        icon: new FontAwesomeIcon("fa fa-font")
    })
    .registerOmniaBlock({
        category: "$Localize:OPM.Core.Blocks.ViewProcess.Title;"
    })

Composer
    .registerManifest(OPMWebComponentManifests.DrawingBlockSettings, "opm.viewprocess.drawing.settings")
    .registerWebComponent({
        elementName: "opm-drawing-block-settings",
        entryPoint: "./DrawingBlockSettings.jsx",
        typings: ["./IDrawingBlockSettings.ts"]
    })