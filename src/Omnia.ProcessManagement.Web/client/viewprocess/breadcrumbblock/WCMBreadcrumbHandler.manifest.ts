import { Composer } from "@omnia/tooling-composers";
import { Guid } from '@omnia/fx/models';
import { WcmWebComponentManifests, WcmService } from '@omnia/wcm/models';

Composer
    .registerManifest(new Guid("719a0e7a-a47e-4bb4-b6e3-c97c367a6d73"), "opm.wcmbreadcrumb.handler")
    .registerResources({
        resourcePaths: ['./WCMBreadcrumbHandler.js']
    })
    .withLoadRules().loadIfManifestLoaded({
        resourceId: WcmWebComponentManifests.Breadcrumb.toString(),
        omniaServiceId: WcmService.Id.toString()
    })