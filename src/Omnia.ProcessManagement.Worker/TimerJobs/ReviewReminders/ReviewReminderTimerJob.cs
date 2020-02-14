using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Omnia.Fx.NetCore.Worker;
using Omnia.ProcessManagement.Core.Services.Images;
using Omnia.ProcessManagement.Core.Services.ReviewReminders;
using Omnia.ProcessManagement.Models.ReviewReminders;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Omnia.ProcessManagement.Worker.TimerJobs.Images
{
    internal class ReviewReminderTimerJob : LifetimeEventsHostedService
    {

        private Timer _timer;
        private int _millisecondsUtilNextRun = 24 * 60 * 60 * 1000; //once a day
        protected IServiceScopeFactory ServiceScopeFactory { get; }
        protected ILogger<ReviewReminderTimerJob> Logger { get; }

        public ReviewReminderTimerJob(IHostApplicationLifetime appLifetime,
            IServiceScopeFactory serviceScopeFactory,
            ILogger<ReviewReminderTimerJob> logger) : base(appLifetime)
        {
            Logger = logger;
            ServiceScopeFactory = serviceScopeFactory;
        }

        public override Task OnStarted()
        {
            _timer = new Timer((state) =>
            {
                _ = TimerRun();
            }, null, 0, Timeout.Infinite);

            return Task.CompletedTask;
        }

        public override Task OnStopped()
        {
            return Task.CompletedTask;
        }

        public override Task OnStopping()
        {
            _timer.Dispose();
            return Task.CompletedTask;
        }

        private async Task TimerRun()
        {

            try
            {
                using (var scope = ServiceScopeFactory.CreateScope())
                {
                    var reviewReminderService = scope.ServiceProvider.GetRequiredService<IReviewReminderService>();
                    var activeQueues = await reviewReminderService.GetActiveQueuesAsync();

                    List<(Guid, ValueTask)> tasks = new List<(Guid, ValueTask)>();
                    foreach (var activeQueue in activeQueues)
                    {
                        tasks.Add((activeQueue.OPMProcessId, ProcessActiveQueueAsync(activeQueue)));
                    }

                    //We ensure all tasks are completed even if there is any failed. So we do not use Task.WhenAll 
                    foreach (var (opmProcessId, task) in tasks)
                    {
                        try
                        {
                            await task;
                        }
                        catch (Exception ex)
                        {
                            //Inner each HandleAsync implemetation should have its own try/catch. then update the working status to failed if error happen
                            //This catch is only used for ensuring unexpected issue happen, then the _lastTimeRunSync will not be updated to let it retry the process again next time
                            Logger.LogError($"Unexpected exception in handling review-reminder for process with OPMProcessId '{opmProcessId}': {ex.Message} - {ex.StackTrace}");
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Logger.LogError($"ReviewReminderTimerJob: {ex.Message}. {ex.StackTrace}");
            }
            finally
            {
                //ready for next run in _millisecondsUtilNextRun;
                _timer.Change(_millisecondsUtilNextRun, Timeout.Infinite);
            }
        }

        private async ValueTask ProcessActiveQueueAsync(ReviewReminderQueue queue)
        {
            using (var scope = ServiceScopeFactory.CreateScope())
            {
                var reviewReminderService = scope.ServiceProvider.GetRequiredService<IReviewReminderService>();
                await reviewReminderService.ProcessQueueAsync(queue);
            }
        }
    }
}
