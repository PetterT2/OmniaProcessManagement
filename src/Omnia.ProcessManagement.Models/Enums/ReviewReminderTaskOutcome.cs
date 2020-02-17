using System;
using System.Collections.Generic;
using System.Text;

namespace Omnia.ProcessManagement.Models.Enums
{
    public enum ReviewReminderTaskOutcome
    {
        Undefined = 0,
        CreateDraft = 1,
        Unpublish = 2,
        SetNewReviewDate = 3
    }
}
