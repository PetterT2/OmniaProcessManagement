import { Composer } from "@omnia/tooling-composers";
import { Guid } from '@omnia/fx/models';
import { ServiceDefinition, ResourceManifests } from '@omnia/workplace/models';

Composer
    .registerManifest(new Guid("6b271e43-e667-443e-a51e-fca6c7f527c9"), "omnia.opm.search.registration")
    .registerResources({
        resourcePaths: ['./Registration.js']
    })
    .withLoadRules().loadIfManifestLoaded({
        omniaServiceId: ServiceDefinition.Id.toString(),
        resourceId: ResourceManifests.SearchCore.toString()
    })