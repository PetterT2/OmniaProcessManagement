using Newtonsoft.Json.Linq;
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
    public interface IReviewReminderDelegateService
    {
        internal ValueTask<DateTime?> EnsureReviewReminderAsync(Guid opmProcessId, Dictionary<string, JToken> enterpriseProperties, DateTime? reviewDate = null);
    }

    public interface IReviewReminderService : IReviewReminderDelegateService
    {
        ValueTask InvalidateExistingQueueAsync(Guid opmProcessId);
        ValueTask ProcessQueueAsync(ReviewReminderQueue queue);
        ValueTask<List<ReviewReminderQueue>> GetActiveQueuesAsync();
        ValueTask CompleteTaskAsync(string spUrl, int id, ReviewReminderTaskOutcome taskOutcome);
    }
}
