import { Composer } from '@omnia/tooling/composers';
import { FontAwesomeIcon } from '@omnia/fx-models';
import { OPMWebComponentManifests, OPMService } from '../../fx/models';

Composer
    .registerManifest(OPMWebComponentManifests.TasksBlock, "opm.viewprocess.tasks")
    .registerWebComponent({
        elementName: "opm-tasks-block",
        entryPoint: "./TasksBlock.jsx"
    })
    .withDefinition({
        title: "$Localize:OPM.Core.BlockDefinitions.Tasks.Title;",
        description: "$Localize:OPM.Core.BlockDefinitions.Tasks.Description;",
        icon: new FontAwesomeIcon("fa fa-tasks")
    })
    .registerOmniaBlock({
        category: "$Localize:OPM.Core.BlockDefinitions.ProcessInformation.Title;"
    })

Composer
    .registerManifest(OPMWebComponentManifests.TasksBlockSettings, "opm.viewprocess.tasks.settings")
    .registerWebComponent({
        elementName: "opm-tasks-block-settings",
        entryPoint: "./TasksBlockSettings.jsx",
        typings: ["./ITasksBlockSettings.ts"]
    })