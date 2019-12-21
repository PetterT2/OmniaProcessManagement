import { Composer } from "@omnia/tooling/composers";
import { Guid, ParamTypes, OmniaRoleTypes, RoleDefinitions, ResourceEvaluators, Parameters } from '@omnia/fx/models';
import { Security } from '../fx/models';

Composer
    .registerManifest(new Guid(Security.OPMRoleDefinitions.Author)).registerRoleDefinition({
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
        editableRoles: [new Guid(RoleDefinitions.AppInstanceAdmin), new Guid(Security.OPMRoleDefinitions.Author)],
    });

Composer
    .registerManifest(new Guid(Security.OPMRoleDefinitions.Approver)).registerRoleDefinition({
        name: "OPM.Approver",
        roleType: OmniaRoleTypes.Custom,
        resourceEvaluatorType: Security.OPMResourceEvaluators.OPMProcessIdResource,
        parameters:
            [
                {
                    name: Security.Parameters.OPMProcessId,
                    type: ParamTypes.Guid,
                }
            ],
        parentRole: null,
        editableRoles: [new Guid(Security.OPMRoleDefinitions.Author)],
    });

Composer
    .registerManifest(new Guid(Security.OPMRoleDefinitions.Reviewer)).registerRoleDefinition({
        name: "OPM.Reviewer",
        roleType: OmniaRoleTypes.Custom,
        resourceEvaluatorType: Security.OPMResourceEvaluators.OPMProcessIdResource,
        parameters:
            [
                {
                    name: Security.Parameters.OPMProcessId,
                    type: ParamTypes.Guid,
                }
            ],
        parentRole: null,
        editableRoles: [new Guid(Security.OPMRoleDefinitions.Author)],
    });

Composer
    .registerManifest(new Guid(Security.OPMRoleDefinitions.Reader)).registerRoleDefinition({
        name: "OPM.Reader",
        roleType: OmniaRoleTypes.Custom,
        resourceEvaluatorType: Security.OPMResourceEvaluators.SecurityResourceIdResource,
        parameters:
            [
                {
                    name: Security.Parameters.SecurityResourceId,
                    type: ParamTypes.Guid,
                }
            ],
        parentRole: new Guid(Security.OPMRoleDefinitions.Author),
        editableRoles: [new Guid(RoleDefinitions.AppInstanceAdmin), new Guid(Security.OPMRoleDefinitions.Author)],
    });