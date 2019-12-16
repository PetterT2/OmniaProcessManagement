﻿export module Enums {
    export module ProcessViewEnums {
        export enum OrderDirection {
            Ascending = 1,
            Descending = 2
        }

        export enum PagingType {
            NoPaging = 1,
            Classic = 2
        }

        export enum StartPageTab {
            Drafts = 0,
            Tasks = 1,
            Published = 2
        }

        export enum PropertyType {
            None = 0,
            Text = 1,
            Number = 2
        }

        export enum ProcessAccessTypes {
            DefaultReaderGroup = 0,
            LimitedAccess = 1
        }       
    }
    export enum ShapeTypes {
        None = 0,
        ProcessStep = 1,
        Link = 2
    }
    export module WorkflowEnums {
        export enum TaskOutcome {
            Approved = 1,
            Rejected = 2
        }

        export enum WorkflowType {
            ReviewWorkflow = 1,
            PublishWorkflow = 2,
            CreateDraft = 3,
            MovedProcess = 4
        }

        export enum WorkflowCompletedType {
            None = 0,
            AllTasksDone = 1,
            MeetDueDate = 2,
            Cancelled = 3
        }

        export enum VersionPublishingTypes {
            NewEdition = 1,
            NewRevision = 2
        }

        export enum ProcessWorkingStatus {
            Draft = 0,
            Published = 1,
            SendingForApproval = 2,
            WaitingForApproval = 3,
            Publishing = 4,
            CancellingApproval = 5,
            FailedSendingForApproval = 6,
            FailedCancellingApproval = 7,
            FailedPublishing = 8
        }
    }

    export module Security {
        export enum OPMRoleDefinitions {
            Author = "f412d0be-16e8-4fc2-80cf-dca39a265a08",
            Reader = "38c86dbf-44a2-45c4-b370-2c1cabea954c",
            Approver = "22672fb9-e62f-470c-a68d-77ae03a5115d",
            Reviewer = "89e89b72-a75c-41d2-8303-b83800980faa"
        }

        export enum OPMResourceEvaluators {
            SecurityResourceIdResource = "Omnia.ProcessManagement.Web.Security.ResourceEvaluators.ISecurityResourceIdResourceEvaluator",
            SiteIdentityResource = "Omnia.ProcessManagement.Web.Security.ResourceEvaluators.ISiteIdentityResourceEvaluator",
        }

        export enum Parameters {
            SiteId = "SiteId",
            WebId = "WebId",
            OPMProcessId = "OPMProcessId",
            SecurityResourceId = "ProcessSecurityResourceId"
        }
    }
}