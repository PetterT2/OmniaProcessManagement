using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.Enums
{
    public enum ProcessWorkingStatus : byte
    {
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
}
