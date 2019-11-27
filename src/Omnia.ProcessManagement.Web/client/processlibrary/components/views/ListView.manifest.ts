import { Composer } from '@omnia/tooling/composers';
import { FontAwesomeIcon } from '@omnia/fx-models';
import { OPMWebComponentManifests } from '../../../fx/models';

Composer
    .registerManifest(OPMWebComponentManifests.ProcessLibraryListView, "opm.processlibrary.listview")
    .registerWebComponent({
        elementName: "opm-process-library-list-view",
        entryPoint: "./ListView.jsx",
        typings: ["./IListView.ts"]
    })