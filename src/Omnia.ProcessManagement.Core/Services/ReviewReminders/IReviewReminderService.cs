using Omnia.ProcessManagement.Models.Enums;
using Omnia.ProcessManagement.Models.Processes;
using Omnia.ProcessManagement.Models.ReviewReminders;
using Omnia.ProcessManagement.Models.Settings;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Services.ReviewReminders
{
    public interface IReviewReminderService
    {
        ValueTask ProcessQueueAsync(ReviewReminderQueue queue);
        ValueTask<List<ReviewReminderQueue>> GetActiveQueuesAsync();
        ValueTask EnsureReviewReminderAsync(Process process, DateTime? reviewDate = null);
        ValueTask CompleteTaskAsync(string spUrl, int id, ReviewReminderTaskOutcome taskOutcome);
    }
}
