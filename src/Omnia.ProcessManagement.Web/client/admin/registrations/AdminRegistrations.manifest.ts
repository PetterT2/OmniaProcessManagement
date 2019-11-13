import { Composer } from '@omnia/tooling/composers';
import { OmniaWebComponentManifests, OmniaService } from '@omnia/fx/models';

Composer
    .registerManifest('fc3ede1c-9ac5-480b-9d1f-6940f3e1d283', "opm.admin.registrations")
    .registerResources({ resourcePaths: ["./AdminRegistrations.js"] })
    .withLoadRules()
    .loadIfManifestLoaded({ omniaServiceId: OmniaService.Id.toString(), resourceId: OmniaWebComponentManifests.Admin.toString() })