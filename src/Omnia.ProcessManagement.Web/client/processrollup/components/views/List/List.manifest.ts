import { Composer } from '@omnia/tooling/composers';
import { OPMWebComponentManifests } from '../../../../fx/models';

Composer
    .registerManifest(OPMWebComponentManifests.ProcessRollupListView, "opm.processrollup.list.view")
    .registerWebComponent({
        elementName: "opm-process-rollup-list-view",
        entryPoint: "./ListView.jsx"
    });

Composer
    .registerManifest(OPMWebComponentManifests.ProcessRollupListViewSettings, "opm.processrollup.list.settings")
    .registerWebComponent({
        elementName: "opm-process-rollup-list-settings",
        entryPoint: "./ListSettings.jsx"
    });
