import { Composer } from "@omnia/tooling-composers";
import { OPMWebComponentManifests } from '../../fx/models';
import { FontAwesomeIcon } from '@omnia/fx-models';

Composer
    .registerManifest(OPMWebComponentManifests.DocumentsBlock, "opm.viewprocess.documents")
    .registerWebComponent({
        elementName: "opm-documents-block",
        entryPoint: "./DocumentsBlock.jsx"
    })
    .withDefinition({
        title: "$Localize:OPM.Core.BlockDefinitions.Documents.Title;",
        description: "$Localize:OPM.Core.BlockDefinitions.Documents.Description;",
        icon: new FontAwesomeIcon("fa fa-font")//todo
    })
    .registerOmniaBlock({
        category: "$Localize:OPM.Core.BlockDefinitions.ProcessInformation.Title;"
    })

Composer
    .registerManifest(OPMWebComponentManifests.DocumentsBlockSettings, "opm.viewprocess.documents.settings")
    .registerWebComponent({
        elementName: "opm-documents-block-settings",
        entryPoint: "./DocumentsBlockSettings.jsx",
        typings: ["./IDocumentsBlockSettings.ts"]
    })