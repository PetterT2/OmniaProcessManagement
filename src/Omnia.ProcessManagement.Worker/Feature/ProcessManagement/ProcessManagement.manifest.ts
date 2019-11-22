import { Composer, DevelopmentEnvironment } from "@omnia/tooling/composers";
import { Guid, FontAwesomeIcon, RoleDefinitions, TargetResolverTypes } from '@omnia/fx-models';

Composer
    .registerManifest(new Guid("af2678fd-e2d5-466f-b8fb-3c5a61a3defe")).registerFeature({
        category: "$Localize:OPM.Core.Features.ProcessManagement.Category;",
        description: "$Localize:OPM.Core.Features.ProcessManagement.Description;",
        icons: [],
        version: "1.0.0",
        title: "$Localize:OPM.Core.Features.ProcessManagement.Title;",
        targetResolverType: TargetResolverTypes.Tenant,
        parameters: [
        ],
        hasProviderHandling: true,
        hidden: false,
        permissionRole: RoleDefinitions.TenantAdmin
    });