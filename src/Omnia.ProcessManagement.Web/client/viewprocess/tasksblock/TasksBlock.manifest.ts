import { Composer } from '@omnia/tooling/composers';
import { FontAwesomeIcon } from '@omnia/fx-models';
import { OPMWebComponentManifests, OPMService } from '../../fx/models';

Composer
    .registerManifest(OPMWebComponentManifests.TasksBlockCore, "opm.viewprocess.tasks.core")
    .registerResources({
        resourcePaths: [
            './loc/**/*.js'
        ]
    })

Composer
    .registerManifest(OPMWebComponentManifests.TasksBlock, "opm.viewprocess.tasks")
    .registerWebComponent({
        elementName: "opm-tasks-block",
        entryPoint: "./TasksBlock.jsx"
    })
    .withDefinition({
        title: "$Localize:OPM.Core.Blocks.Tasks.Title;",
        description: "$Localize:OPM.Core.Blocks.Tasks.Description;",
        icon: new FontAwesomeIcon("fa fa-tasks")
    })
    .registerOmniaBlock({
        category: "$Localize:OPM.Core.Blocks.ProcessInformation.Title;"
    })

Composer
    .registerManifest(OPMWebComponentManifests.TasksBlockSettings, "opm.viewprocess.tasks.settings")
    .registerWebComponent({
        elementName: "opm-tasks-block-settings",
        entryPoint: "./TasksBlockSettings.jsx",
        typings: ["./ITasksBlockSettings.ts"]
    })