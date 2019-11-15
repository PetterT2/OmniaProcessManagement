import { Composer } from '@omnia/tooling/composers';
import { FontAwesomeIcon } from '@omnia/fx-models';

Composer
    .registerManifest("e8a798e1-4be4-44e2-86f1-aa548b5c5d1f", "opm.fabric.play")
    .registerWebComponent({
        elementName: "opm-fabric-play",
        entryPoint: "./FabricPlay.jsx"
    })
    .withDefinition({
        title: "FabricPlay",
        description: "",
        icon: new FontAwesomeIcon("fa fa-file-alt")
    })
    .registerSpfxWebpart({
        category: "Omnia Process Management"
    })