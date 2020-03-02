export const OPMEnterprisePropertyInternalNames = {
    get OPMEdition() { return "OPMEdition" },
    get OPMRevision() { return "OPMRevision" },
    get OPMProcessType() { return "OPMProcessType" }
}

export const OPMProcessProperty = {
    get Id() { return "7491ec1a-9cf5-4c49-b102-2f84f89795eb" }
}

export module Security {
    export const OPMRoleDefinitions = {
        get Author() { return "f412d0be-16e8-4fc2-80cf-dca39a265a08" },
        get Reader() { return "38c86dbf-44a2-45c4-b370-2c1cabea954c" },
        get Approver() { return "22672fb9-e62f-470c-a68d-77ae03a5115d" },
        get Reviewer() { return "89e89b72-a75c-41d2-8303-b83800980faa" }
    }

    export const OPMResourceEvaluators = {
        get SecurityResourceIdResource() { return "Omnia.ProcessManagement.Web.Security.ResourceEvaluators.ISecurityResourceIdResourceEvaluator" },
        get OPMProcessIdResource() { return "Omnia.ProcessManagement.Web.Security.ResourceEvaluators.IOPMProcessIdResourceEvaluator" }
    }

    export const Parameters = {
        get OPMProcessId() { return "opmProcessId" },
        get SecurityResourceId() { return "opmSecurityResourceId" }
    }
}