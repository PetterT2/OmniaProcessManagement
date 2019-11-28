import { Composer } from '@omnia/tooling/composers';
import { OPMWebComponentManifests, OPMService, OPMResourceManifests } from '../../fx/models';
import { FontAwesomeIcon } from '@omnia/fx-models';

Composer
    .registerManifest(OPMWebComponentManifests.BlockProcessRenderer, "opm.blockprocessrenderer")
    .registerWebComponent({
        elementName: "opm-block-process-renderer",
        entryPoint: "./BlockProcessRenderer.jsx"
    })
    .withDefinition({
        title: "$Localize:OPM.Core.Blocks.ProcessRenderer.Title;",
        description: "$Localize:OPM.Core.Blocks.ProcessRenderer.Description;",
        icon: new FontAwesomeIcon("fal fa-draw-circle")
    })
    .registerSpfxWebpart()
    .registerOmniaBlock({
        category: "$Localize:OPM.Core.BlockCategories.Process;"
    });

