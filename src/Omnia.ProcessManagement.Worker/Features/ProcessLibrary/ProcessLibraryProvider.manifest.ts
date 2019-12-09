import { Composer } from "@omnia/tooling/composers";
import { Guid, FontAwesomeIcon, RoleDefinitions, TargetResolverTypes } from '@omnia/fx-models';

Composer
    .registerManifest(new Guid("73dcb5d4-b359-471c-ad8e-1e66c2f36bbd")).registerFeature({
        category: "$Localize:OPM.Core.Features.ProcessLibrary.Category;",
        description: "$Localize:OPM.Core.Features.ProcessLibrary.Description;",
        icons: [new FontAwesomeIcon("fal fa-angle-double-right")],
        title: "$Localize:OPM.Core.Features.ProcessLibrary.Title;",
        version: "1.0.0",
        targetResolverType: TargetResolverTypes.AppInstance,
        parameters: [
        ],
        hasProviderHandling: true,
        permissionRole: RoleDefinitions.AppInstanceAdmin,
        hidden: false
    });