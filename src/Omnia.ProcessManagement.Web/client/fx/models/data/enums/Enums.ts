export enum TextPosition {
    Above = 1,
    On = 2,
    Bottom = 3
}

export enum TextAlignment {
    Left = 'left',
    Center = 'center',
    Right = 'right'
}

export enum ProcessVersionType {
    Draft = 0,
    CheckedOut = 1,
    Archived = 2,
    Published = 3
}

export enum ProcessStepType {
    Internal = 0,
    External = 1
}

export enum ProcessWorkingStatus {
    None = 0,

    SendingForReview = 1,
    SendingForReviewFailed = 2,
    SentForReview = 3,
    CancellingReview = 4,
    CancellingReviewFailed = 5,

    SendingForApproval = 6,
    SendingForApprovalFailed = 7,
    SentForApproval = 8,
    CancellingApproval = 9,
    CancellingApprovalFailed = 10,

    SyncingToSharePoint = 11,
    SyncingToSharePointFailed = 12,

    Archiving = 13,
    ArchivingFailed = 14
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

export enum TaskOutcome {
    Approved = 1,
    Rejected = 2
}

export enum ShapeTemplateType {
    CircleShape = 1,
    PentagonShape = 2,
    DiamondShape = 3,
    FreeformShape = 4,
    MediaShape = 5
}

