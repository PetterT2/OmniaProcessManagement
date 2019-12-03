import { Composer } from '@omnia/tooling/composers';
import { OPMWebComponentManifests, OPMService, OPMResourceManifests } from '../../fx/models';
import { FontAwesomeIcon, Guid } from '@omnia/fx-models';

Composer
    .registerManifest(new Guid('e1bb8fa2-0511-4fe1-a4b2-9782623fa7a2'), "opm.test.component")
    .registerWebComponent({
        elementName: "opm-test-component",
        entryPoint: "./Test.jsx"
    })
    .withDefinition({
        title: "Test Process List",
        description: "",
        icon: new FontAwesomeIcon("fal fa-draw-circle")
    })
    .registerSpfxWebpart()
    .registerOmniaBlock({
        category: "$Localize:OPM.Core.BlockCategories.Process;"
    });

