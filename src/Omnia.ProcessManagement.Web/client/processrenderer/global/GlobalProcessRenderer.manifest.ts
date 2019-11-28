import { Composer } from '@omnia/tooling/composers';
import { OPMWebComponentManifests, OPMService, OPMResourceManifests } from '../../fx/models';

Composer
    .registerManifest(OPMWebComponentManifests.GlobalProcessRenderer, "opm.globalprocessrenderer")
    .registerWebComponent({
        elementName: "opm-global-process-renderer",
        entryPoint: "./GlobalProcessRenderer.jsx"
    })
    .withLoadRules()
    .loadIfManifestLoaded({
        omniaServiceId: OPMService.Id.toString(),
        resourceId: OPMResourceManifests.FxCore.toString()
    });

