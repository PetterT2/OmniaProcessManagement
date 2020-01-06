import { Composer } from "@omnia/tooling-composers";
import { Guid } from '@omnia/fx-models';
import { OPMService, OPMWebComponentManifests, OPMResourceManifests } from '../../fx/models';

Composer
    .registerManifest(OPMResourceManifests.ProcessRollupViewRegistration, "opm.processrollup.viewregistration")
    .registerResources({
        resourcePaths: ['./Registration.js']
    })
    .withLoadRules().loadIfManifestLoaded({
        omniaServiceId: OPMService.Id.toString(),
        resourceId: OPMWebComponentManifests.ProcessRollup.toString()
    })
    .or()
    .loadIfManifestLoaded({
        omniaServiceId: OPMService.Id.toString(),
        resourceId: OPMWebComponentManifests.ProcessRollupSettings.toString()
    })