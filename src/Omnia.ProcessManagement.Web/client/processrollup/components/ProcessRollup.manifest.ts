import { Composer } from '@omnia/tooling/composers';
import { FontAwesomeIcon } from '@omnia/fx-models';
import { OPMWebComponentManifests } from '../../fx/models';

Composer
    .registerManifest(OPMWebComponentManifests.ProcessRollup, "opm.processrollup")
    .registerWebComponent({
        elementName: "opm-process-rollup",
        entryPoint: "./ProcessRollup.jsx"
    })
    .withDefinition({
        title: "$Localize:OPM.Core.BlockDefinitions.ProcessRollup.Title;",
        description: "$Localize:OPM.Core.BlockDefinitions.ProcessRollup.Description;",
        icon: new FontAwesomeIcon("fal fa-file-alt")
    })
    .registerOmniaBlock({
        category: "$Localize:WCM.Fx.Categories.ContentRollup;"
    });

Composer
    .registerManifest(OPMWebComponentManifests.ProcessRollupSettings, "opm.processrollup.settings")
    .registerWebComponent({
        elementName: "opm-process-rollup-settings",
        entryPoint: "./ProcessRollupSettings.jsx"
    })