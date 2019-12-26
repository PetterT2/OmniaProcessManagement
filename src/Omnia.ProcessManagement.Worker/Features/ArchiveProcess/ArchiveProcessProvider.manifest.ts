import { Composer, DevelopmentEnvironment } from "@omnia/tooling/composers";
import { Guid, FontAwesomeIcon, RoleDefinitions, TargetResolverTypes } from '@omnia/fx-models';

Composer
    .registerManifest(new Guid("2c5a48d7-7fc6-44a2-827f-ddbd99ef9c5e")).registerFeature({
        category: "$Localize:OPM.Core.Features.ArchiveProcess.Category;",
        description: "$Localize:OPM.Core.Features.ArchiveProcess.Description;",
        icons: [new FontAwesomeIcon("far fa-american-sign-language-interpreting")],
        title: "$Localize:OPM.Core.Features.ArchiveProcess.Title;",
        version: "1.0.0",
        targetResolverType: TargetResolverTypes.AppInstance,
        parameters: [
        ],
        hasProviderHandling: true,
        permissionRole: RoleDefinitions.AppInstanceAdmin,
        hidden: false
    });