import { Composer } from '@omnia/tooling/composers';
import { FontAwesomeIcon } from '@omnia/fx-models';
import { OPMWebComponentManifests, OPMService } from '../../fx/models';

Composer
    .registerManifest(OPMWebComponentManifests.ProcessContextBlock, "opm.viewprocess.processcontext")
    .registerWebComponent({
        elementName: "opm-process-context-block",
        entryPoint: "./ProcessContextBlock.jsx"
    })
    .withDefinition({
        title: "$Localize:OPM.Core.BlockDefinitions.ProcessContext.Title;",
        description: "$Localize:OPM.Core.BlockDefinitions.ProcessContext.Description;",
        icon: new FontAwesomeIcon("fa fa-info-circle")
    })
    .registerOmniaBlock({
        category: "$Localize:OPM.Core.BlockDefinitions.ProcessInformation.Title;"
    })

Composer
    .registerManifest(OPMWebComponentManifests.ProcessContextBlockSettings, "opm.viewprocess.processcontext.settings")
    .registerWebComponent({
        elementName: "opm-process-context-block-settings",
        entryPoint: "./ProcessContextBlockSettings.jsx",
        typings: ["./IProcessContextBlockSettings.ts"]
    })