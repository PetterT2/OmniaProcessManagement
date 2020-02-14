
using Microsoft.EntityFrameworkCore;
using Omnia.ProcessManagement.Models.ReviewReminders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Core.Repositories.ReviewReminders
{
    internal class ReviewReminderRepository : IReviewReminderRepository
    {
        OmniaPMDbContext DBContext { get; }
        public ReviewReminderRepository(OmniaPMDbContext databaseContext)
        {
            DBContext = databaseContext;
        }

        public async ValueTask AddPendingQueueAsync(ReviewReminderQueue queue)
        {
            var pendingQueueExists = await DBContext.ReviewReminderQueues.AnyAsync(r => r.OPMProcessId == queue.OPMProcessId && r.Pending);
            if (pendingQueueExists)
            {
                throw new Exception($"There is already a pending review-reminder queue for this process with OPMProcessId: {queue.OPMProcessId}");
            }

            DBContext.ReviewReminderQueues.Add(new Entities.ReviewReminders.ReviewReminderQueue
            {
                OPMProcessId = queue.OPMProcessId,
                Pending = true,
                ReviewDate = queue.ReviewDate,
                ReviewReminderDate = queue.ReviewReminderDate
            });
            await DBContext.SaveChangesAsync();
        }

        public async ValueTask DoneQueueAsync(int queueId, string log)
        {
            var pendingQueue = await DBContext.ReviewReminderQueues.AsTracking().FirstOrDefaultAsync(r => r.Id == queueId);
           
            pendingQueue.Pending = false;
            pendingQueue.Log = log;
            await DBContext.SaveChangesAsync();
        }

        public async ValueTask<List<ReviewReminderQueue>> GetActiveQueuesAsync()
        {
            var result = new List<ReviewReminderQueue>();
            var maxTime = DateTimeOffset.UtcNow.Date.AddDays(1).AddTicks(-1);

            var efs = await DBContext.ReviewReminderQueues.Where(r => r.ReviewReminderDate <= maxTime && r.Pending).ToListAsync();
            efs.ForEach(ef =>
            {
                result.Add(new ReviewReminderQueue
                {
                    Id = ef.Id,
                    OPMProcessId = ef.OPMProcessId,
                    ReviewDate = ef.ReviewDate,
                    ReviewReminderDate = ef.ReviewReminderDate
                });
            });

            return result;
        }
    }
}
