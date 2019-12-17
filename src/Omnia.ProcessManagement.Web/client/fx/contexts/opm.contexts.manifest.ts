import { Composer } from '@omnia/tooling-composers';

import { OmniaService, OmniaResourceManifests } from '@omnia/fx-models';
import { OPMResourceManifests } from '../models';

Composer.registerManifest(OPMResourceManifests.Contexts, "opm.contexts.contexts")
    .registerResources({
        resourcePaths: [
            "./index.js",
            './OPMContextProvider.js'
        ]
    })
    //We load when fx contexts has been loaded
    .withLoadRules().loadIfManifestLoaded({
        omniaServiceId: OmniaService.Id.toString(),
        resourceId: OmniaResourceManifests.FxContexts.toString()
    }).done();