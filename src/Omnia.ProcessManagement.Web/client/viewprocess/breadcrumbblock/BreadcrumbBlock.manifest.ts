import { Composer } from '@omnia/tooling/composers';
import { FontAwesomeIcon } from '@omnia/fx-models';
import { OPMWebComponentManifests, OPMService } from '../../fx/models';

Composer
    .registerManifest(OPMWebComponentManifests.BreadcrumbBlock, "opm.viewprocess.breadcrumb")
    .registerWebComponent({
        elementName: "opm-breadcrumb-block",
        entryPoint: "./BreadcrumbBlock.jsx"
    })
    .withDefinition({
        title: "$Localize:OPM.Core.BlockDefinitions.Breadcrumb.Title;",
        description: "$Localize:OPM.Core.BlockDefinitions.Breadcrumb.Description;",
        icon: new FontAwesomeIcon("fas fa-ellipsis-h")
    })
    .registerOmniaBlock({
        category: "$Localize:OPM.Core.Blocks.ProcessInformation.Title;"
    })

Composer
    .registerManifest(OPMWebComponentManifests.BreadcrumbBlockSettings, "opm.viewprocess.breadcrumb.settings")
    .registerWebComponent({
        elementName: "opm-breadcrumb-block-settings",
        entryPoint: "./BreadcrumbBlockSettings.jsx",
        typings: ["./IBreadcrumbBlockSettings.ts"]
    })