import { Composer } from "@omnia/tooling-composers";
import { Guid } from '@omnia/fx/models';
import { ResourceManifests, ServiceDefinition } from '@omnia/workplace/models';

Composer
    .registerManifest(new Guid("FECE2831-389D-4FAA-BA13-FC5795707D46"), "opm.processlibrary.taskprocessor")
    .registerResources({
        resourcePaths: ['./Registration.js']
    })
    .withLoadRules().loadIfManifestLoaded({
        omniaServiceId: ServiceDefinition.Id.toString(),
        resourceId: ResourceManifests.MyTasksCore.toString()
    })