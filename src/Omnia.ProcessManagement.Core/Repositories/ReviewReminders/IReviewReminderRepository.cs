
using Omnia.ProcessManagement.Models.ReviewReminders;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Repositories.ReviewReminders
{
    internal interface IReviewReminderRepository
    {
        ValueTask InvalidateExistingQueueAsync(Guid opmProcessId);
        ValueTask AddPendingQueueAsync(ReviewReminderQueue queue, bool invalidateExistingQueue);
        ValueTask DoneQueueAsync(int queueId, string log);
        ValueTask<List<ReviewReminderQueue>> GetActiveQueuesAsync();
    }
}
