export enum TextPosition {
    Above = 1,
    Center = 2,
    Bottom = 3
}

export enum ProcessVersionType {
    Draft = 0,
    CheckedOut = 1,
    Published = 2,
    LatestPublished = 3
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
    SyncingToSharePointFailed = 12
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
