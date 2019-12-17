import { Composer } from "@omnia/tooling/composers";
import { Guid, ParamTypes, OmniaRoleTypes, RoleDefinitions, ResourceEvaluators, Parameters } from '@omnia/fx/models';
import { Enums } from '../fx/models';

Composer
    .registerManifest(new Guid(Enums.Security.OPMRoleDefinitions.Author)).registerRoleDefinition({
        name: "OPM.Author",
        roleType: OmniaRoleTypes.Custom,
        resourceEvaluatorType: ResourceEvaluators.AppInstance,
        parameters:
            [
                {
                    name: Parameters.AppInstanceId,
                    type: ParamTypes.Guid,
                }
            ],
        parentRole: null,
        editableRoles: [new Guid(RoleDefinitions.AppInstanceAdmin), new Guid(Enums.Security.OPMRoleDefinitions.Author)],
    });

Composer
    .registerManifest(new Guid(Enums.Security.OPMRoleDefinitions.Approver)).registerRoleDefinition({
        name: "OPM.Approver",
        roleType: OmniaRoleTypes.Custom,
        resourceEvaluatorType: Enums.Security.OPMResourceEvaluators.OPMProcessIdResource,
        parameters:
            [
                {
                    name: Enums.Security.Parameters.OPMProcessId,
                    type: ParamTypes.Guid,
                }
            ],
        parentRole: null,
        editableRoles: [new Guid(Enums.Security.OPMRoleDefinitions.Author)],
    });

Composer
    .registerManifest(new Guid(Enums.Security.OPMRoleDefinitions.Reviewer)).registerRoleDefinition({
        name: "OPM.Reviewer",
        roleType: OmniaRoleTypes.Custom,
        resourceEvaluatorType: Enums.Security.OPMResourceEvaluators.OPMProcessIdResource,
        parameters:
            [
                {
                    name: Enums.Security.Parameters.OPMProcessId,
                    type: ParamTypes.Guid,
                }
            ],
        parentRole: null,
        editableRoles: [new Guid(Enums.Security.OPMRoleDefinitions.Author)],
    });

Composer
    .registerManifest(new Guid(Enums.Security.OPMRoleDefinitions.Reader)).registerRoleDefinition({
        name: "OPM.Reader",
        roleType: OmniaRoleTypes.Custom,
        resourceEvaluatorType: Enums.Security.OPMResourceEvaluators.SecurityResourceIdResource,
        parameters:
            [
                {
                    name: Enums.Security.Parameters.SecurityResourceId,
                    type: ParamTypes.Guid,
                }
            ],
        parentRole: new Guid(Enums.Security.OPMRoleDefinitions.Author),
        editableRoles: [new Guid(RoleDefinitions.AppInstanceAdmin), new Guid(Enums.Security.OPMRoleDefinitions.Author)],
    });